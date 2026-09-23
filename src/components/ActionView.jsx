import { useId, useMemo, useRef, useState } from 'react';
import { Play, Download, Save, Trash2, Send, Loader2, KeyRound, ShieldAlert, AlertTriangle, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/actions';
import { labelFor } from '../data/labels';
import { HELP, cleanDescription } from '../data/help';
import { callApi } from '../lib/api';
import { bodySchemaOf, missingInBody, prune, resolveRef, isDateTime, isMonth } from '../lib/spec';
import { lookupFor } from '../lib/lookups';
import { localInputToIso, nowCdmx, extractRows, toCsv, downloadFile, slug } from '../lib/format';
import DateRange from './DateRange';
import { presetValues } from '../lib/dates';
import SchemaForm from './SchemaForm';
import ResultView from './ResultView';
import Widget from './Widget';
import { Collapsible, ConfirmDialog, Field } from './ui';

const HIDDEN_PARAMS = new Set(['next-page-token']);
const MAX_PAGES = 100;

export default function ActionView({ spec, op, token, connected, onOpenConnection, onNavigate }) {
  const params = useMemo(() => (op.details.parameters || []).filter((p) => !HIDDEN_PARAMS.has(p.name)), [op]);
  const bodySchema = useMemo(() => bodySchemaOf(spec, op.details), [spec, op]);
  const hasBody = !!bodySchema && (bodySchema.properties || bodySchema.oneOf || bodySchema.additionalProperties);
  const hasDates = params.some((p) => p.name === 'from') || params.some((p) => p.name === 'to');

  const [values, setValues] = useState(() => {
    const init = {};
    if (hasDates) {
      const preset = op.path === '/sessions' ? '7d' : 'auto';
      Object.assign(init, presetValues(preset), { __preset: preset });
    }
    return init;
  });
  const [body, setBody] = useState(() => seedBody(spec, bodySchema));
  const [openedAt] = useState(() => Date.now());
  const [showErrors, setShowErrors] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [rows, setRows] = useState(null);
  const [paging, setPaging] = useState(null);
  const resultRef = useRef(null);
  const formRef = useRef(null);

  const setValue = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));
  const category = CATEGORIES.find((c) => c.id === op.cat);

  // ─── Validación ──────────────────────────────────────────────────────────
  const missing = useMemo(() => {
    const list = [];
    params.forEach((p) => {
      const v = values[p.name];
      const empty = v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
      if (p.required && empty) list.push({ label: labelFor(p.name, op.path), key: `param:${p.name}` });
    });
    if (hasBody) {
      missingInBody(spec, bodySchema, body).forEach((m) => {
        const last = [...m.path].reverse().find((x) => typeof x === 'string') || 'datos';
        list.push({ label: m.reason === 'chat' ? 'Conversación' : labelFor(last, op.path), key: m.path.join('.') });
      });
    }
    if (values.from && values.to && new Date(values.from) > new Date(values.to)) {
      list.push({ label: 'Periodo de fechas', key: 'param:to' });
    }
    return list;
  }, [params, values, hasBody, spec, bodySchema, body, op.path]);

  const missingKeys = useMemo(() => new Set(showErrors ? missing.map((m) => m.key) : []), [missing, showErrors]);
  const paramError = (name) => (missingKeys.has(`param:${name}`) ? 'Este dato es obligatorio.' : null);

  // ─── Construcción de la consulta ─────────────────────────────────────────
  const buildRequest = () => {
    let path = op.path;
    const query = {};
    params.forEach((p) => {
      let v = values[p.name];
      if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return;
      const schema = resolveRef(spec, p.schema);
      // Los meses (p. ej. periodo facturado) van tal cual: "2026-09". Botmaker rechaza una fecha completa.
      if (isMonth(schema, p.name)) v = String(v).slice(0, 7);
      else if (isDateTime(schema)) v = localInputToIso(v);
      if (p.in === 'path') path = path.replace(`{${p.name}}`, encodeURIComponent(String(v).trim()));
      else if (p.in === 'query') query[p.name] = Array.isArray(v) ? v : String(v).trim();
    });
    const payload = hasBody ? prune(serializeDates(spec, bodySchema, body)) ?? {} : undefined;
    return { path, query, body: payload };
  };

  const execute = async () => {
    setConfirming(false);
    setRunning(true);
    setResult(null);
    setRows(null);
    setPaging(null);
    const req = buildRequest();
    const res = await callApi({ method: op.method, token, ...req });
    const next = res.ok ? res.data?.nextPage : null;
    setResult({ ...res, at: nowCdmx() });
    if (res.ok) setRows(extractRows(res.data).rows);
    setPaging(next ? { hasMore: true, next, req } : null);
    setRunning(false);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const fetchNext = (p) => {
    if (/^https?:\/\//.test(p.next)) return callApi({ path: p.next, token });
    return callApi({ path: p.req.path, query: { ...p.req.query, 'next-page-token': p.next }, token });
  };

  const loadMore = async () => {
    setPaging((p) => ({ ...p, loading: true }));
    const res = await fetchNext(paging);
    if (!res.ok) {
      setPaging((p) => ({ ...p, loading: false, progress: `No se pudo cargar más: ${res.error.title}.` }));
      return;
    }
    const more = extractRows(res.data).rows || [];
    setRows((r) => [...(r || []), ...more]);
    setPaging((p) => ({ ...p, loading: false, progress: null, hasMore: !!res.data?.nextPage, next: res.data?.nextPage }));
  };

  const downloadAll = async () => {
    let all = [...(rows || [])];
    let p = { ...paging };
    let page = 1;
    setPaging({ ...p, loading: true, progress: 'Descargando página 2…' });
    while (p.hasMore && page < MAX_PAGES) {
      const res = await fetchNext(p);
      if (!res.ok) {
        setPaging({ ...p, loading: false, progress: `Se detuvo en la página ${page + 1}: ${res.error.title}. Se descargó lo obtenido hasta ahora.` });
        break;
      }
      all = all.concat(extractRows(res.data).rows || []);
      page += 1;
      p = { ...p, hasMore: !!res.data?.nextPage, next: res.data?.nextPage };
      setPaging({ ...p, loading: true, progress: `Descargando página ${page + 1}… (${all.length.toLocaleString('es-MX')} registros)` });
    }
    setRows(all);
    downloadFile(toCsv(all), `${slug(op.name)}-completo.csv`);
    setPaging({ ...p, loading: false, progress: `Listo: se descargaron ${all.length.toLocaleString('es-MX')} registros.` });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!connected) return onOpenConnection();
    if (missing.length) {
      setShowErrors(true);
      requestAnimationFrame(() => {
        formRef.current?.querySelector('[aria-invalid="true"], .has-error, .tone-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return undefined;
    }
    if (op.danger || op.confirm) setConfirming(true);
    else execute();
    return undefined;
  };

  // ─── Organización de los filtros ─────────────────────────────────────────
  const pathParams = params.filter((p) => p.in === 'path');
  const queryParams = params.filter((p) => p.in === 'query' && p.name !== 'from' && p.name !== 'to');
  const requiredQuery = queryParams.filter((p) => p.required);
  const includeParams = queryParams.filter((p) => !p.required && /^include-/.test(p.name));
  const optionalQuery = queryParams.filter((p) => !p.required && !/^include-/.test(p.name));
  const fromP = params.find((p) => p.name === 'from');
  const toP = params.find((p) => p.name === 'to');
  const deps = { catalogId: values.catalogId };
  const ctx = { spec, opPath: op.path, token, missing: missingKeys, deps };

  const renderParam = (p) => (
    <ParamField key={p.name} spec={spec} param={p} opPath={op.path} token={token} deps={deps}
      value={values[p.name]} onChange={(v) => setValue(p.name, v)} error={paramError(p.name)} />
  );

  const weekAgo = openedAt - 7 * 24 * 60 * 60 * 1000;
  const needsLongTerm = params.some((p) => p.name === 'long-term-search') &&
    values.from && new Date(values.from).getTime() < weekAgo && values['long-term-search'] !== true;

  const hasInputs = pathParams.length + requiredQuery.length + optionalQuery.length + includeParams.length > 0 || hasDates;
  const btn = buttonFor(op);
  let step = 0;

  return (
    <div className="main-content">
      <nav className="breadcrumbs" aria-label="Ruta">
        <button type="button" className="link-btn" onClick={() => onNavigate('#/')}>Inicio</button>
        <ChevronRight size={14} aria-hidden="true" />
        <button type="button" className="link-btn" onClick={() => onNavigate(`#/cat/${op.cat}`)}>{category?.name}</button>
      </nav>

      <header className={`action-header ${op.danger ? 'is-danger' : ''}`}>
        <h1>{op.name}</h1>
        <p>{op.desc}</p>
        {op.danger === 'critical' && (
          <p className="warning-box critical"><ShieldAlert size={18} aria-hidden="true" /> Acción delicada: puede dejar sin acceso a todo tu equipo. Hazlo solo si soporte te lo indicó.</p>
        )}
        {op.danger === 'delete' && (
          <p className="warning-box"><AlertTriangle size={18} aria-hidden="true" /> Esta acción borra información y no se puede deshacer.</p>
        )}
        {op.details.description && (
          <Collapsible title="Más información de Botmaker" subtitle="Texto original, en inglés">
            <p className="original-text">{cleanDescription(op.details.description)}</p>
          </Collapsible>
        )}
      </header>

      {!connected && (
        <div className="warning-box connect-box" role="status">
          <KeyRound size={18} aria-hidden="true" />
          <span>Para usar esta acción, primero conecta tu cuenta de Botmaker.</span>
          <button type="button" className="btn btn-primary" onClick={onOpenConnection}>Conectar mi cuenta</button>
        </div>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        {hasInputs && (
          <section className="card step">
            <h2><span className="step-num">{++step}</span> {pathParams.length || requiredQuery.length ? 'Elige qué quieres consultar o modificar' : 'Filtra (opcional)'}</h2>
            {(pathParams.length > 0 || requiredQuery.length > 0) && (
              <div className="form-grid">{[...pathParams, ...requiredQuery].map(renderParam)}</div>
            )}
            {hasDates && (
              <DateRange
                from={values.from} to={values.to} preset={values.__preset}
                fromRequired={fromP?.required} toRequired={toP?.required}
                errors={{ from: paramError('from'), to: paramError('to') }}
                onChange={({ from, to, preset }) => setValues((v) => ({ ...v, from, to, __preset: preset }))}
              />
            )}
            {needsLongTerm && (
              <div className="warning-box" role="status">
                <AlertTriangle size={18} aria-hidden="true" />
                <span>Elegiste fechas de hace más de 7 días. Para verlas hay que activar la búsqueda histórica (suma al consumo de datos de tu cuenta).</span>
                <button type="button" className="btn btn-secondary" onClick={() => setValue('long-term-search', true)}>Activar búsqueda histórica</button>
              </div>
            )}
            {optionalQuery.length > 0 && (
              optionalQuery.length > 3 ? (
                <Collapsible title="Filtros opcionales" subtitle={`${optionalQuery.length} filtros para afinar la búsqueda`}>
                  <div className="form-grid">{optionalQuery.map(renderParam)}</div>
                </Collapsible>
              ) : (
                <div className="form-grid">{optionalQuery.map(renderParam)}</div>
              )
            )}
            {includeParams.length > 0 && (
              <fieldset className="include-box">
                <legend>¿Qué quieres incluir?</legend>
                <div className="form-grid">
                  {includeParams.map((p) => (
                    <label key={p.name} className="check-card">
                      <input type="checkbox" checked={!!values[p.name]} onChange={(e) => setValue(p.name, e.target.checked || undefined)} />
                      <span>
                        <strong>{labelFor(p.name, op.path)}</strong>
                        {HELP[p.name] && <small>{HELP[p.name]}</small>}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>
        )}

        {hasBody && (
          <section className="card step">
            <h2><span className="step-num">{++step}</span> Completa la información</h2>
            <p className="step-hint">Los campos con <span className="req">*</span> son obligatorios. Toca <strong>ⓘ</strong> para ver una ayuda.</p>
            <SchemaForm ctx={ctx} schema={bodySchema} value={body} onChange={setBody} />
          </section>
        )}

        <section className="card step run-step">
          <h2><span className="step-num">{++step}</span> {op.method === 'GET' ? 'Consulta' : 'Confirma'}</h2>
          {missing.length > 0 && (
            <p className={`missing-summary ${showErrors ? 'is-error' : ''}`} role={showErrors ? 'alert' : undefined}>
              Falta{missing.length > 1 ? 'n' : ''} {missing.length} dato{missing.length > 1 ? 's' : ''} obligatorio{missing.length > 1 ? 's' : ''}: {[...new Set(missing.map((m) => m.label))].join(', ')}.
            </p>
          )}
          <button
            type="submit"
            className={`btn btn-lg ${op.danger ? 'btn-danger' : 'btn-primary'} ${missing.length || !connected ? 'is-muted' : ''}`}
            disabled={running}
          >
            {running ? <Loader2 size={18} className="spin" /> : btn.icon}
            {running ? 'Procesando…' : !connected ? 'Conecta tu cuenta para continuar' : btn.label}
          </button>
        </section>
      </form>

      <div ref={resultRef}>
        {result && (
          <ResultView op={op} result={result} rows={rows} paging={paging}
            onLoadMore={loadMore} onDownloadAll={downloadAll} onReconnect={onOpenConnection} />
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        tone={op.danger ? 'danger' : 'primary'}
        title={op.danger ? `¿Seguro que quieres continuar con “${op.name}”?` : `¿Enviar ahora?`}
        confirmLabel={op.danger ? 'Sí, continuar' : 'Sí, enviar'}
        requireWord={op.danger === 'critical' ? 'CONFIRMAR' : undefined}
        onConfirm={execute}
        onCancel={() => setConfirming(false)}
      >
        <p>{op.danger ? `${op.desc} Esto no se puede deshacer.` : op.confirm}</p>
        <Summary params={params} values={values} body={body} opPath={op.path} />
      </ConfirmDialog>
    </div>
  );
}

function ParamField({ spec, param, opPath, token, deps, value, onChange, error }) {
  const id = useId();
  const schema = resolveRef(spec, param.schema);
  const help = HELP[param.name] || cleanDescription(param.description);
  const lookup = lookupFor(param.name, opPath);
  return (
    <Field label={labelFor(param.name, opPath)} required={param.required} help={help}
      helpIsOriginal={!HELP[param.name] && !!help} htmlFor={id} error={error} wide={schema.type === 'array'}>
      <Widget name={param.name} schema={schema} value={value} onChange={onChange} lookup={lookup}
        token={token} deps={deps} id={id} invalid={!!error} requiredEnum={param.required} isFilter={param.in === 'query'}
        placeholder={param.example ? `Ej.: ${param.example}` : undefined} />
    </Field>
  );
}

function Summary({ params, values, body, opPath }) {
  const items = params
    .filter((p) => p.in === 'path' && values[p.name] !== undefined && values[p.name] !== '')
    .map((p) => [labelFor(p.name, opPath), String(values[p.name])]);
  const chat = body?.chat;
  if (chat?.chatId) items.push(['Conversación', chat.chatId]);
  if (chat?.contactId) items.push(['Cliente', chat.contactId]);
  if (Array.isArray(body?.chats)) items.push(['Conversaciones', `${body.chats.length}`]);
  if (!items.length) return null;
  return (
    <ul className="confirm-summary">
      {items.map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
    </ul>
  );
}

function buttonFor(op) {
  if (op.danger === 'delete') return { label: 'Borrar', icon: <Trash2 size={18} /> };
  if (op.danger === 'critical') return { label: 'Continuar', icon: <ShieldAlert size={18} /> };
  if (op.method === 'GET') {
    return /Descargar/.test(op.name)
      ? { label: 'Ver y descargar', icon: <Download size={18} /> }
      : { label: 'Ver resultados', icon: <Play size={18} /> };
  }
  if (op.method === 'PATCH' || op.method === 'PUT') return { label: 'Guardar cambios', icon: <Save size={18} /> };
  if (op.cat === 'enviar') return { label: 'Enviar', icon: <Send size={18} /> };
  return { label: 'Guardar', icon: <Save size={18} /> };
}

// Convierte fechas del calendario al formato que espera Botmaker.
function serializeDates(spec, schema, value) {
  const s = resolveRef(spec, schema);
  if (value === undefined || value === null) return value;
  if (isDateTime(s) && typeof value === 'string') return localInputToIso(value);
  if (Array.isArray(value)) return value.map((v) => serializeDates(spec, s.items, v));
  if (typeof value === 'object' && s.properties) {
    const out = { ...value };
    Object.entries(s.properties).forEach(([k, child]) => {
      if (k in out) out[k] = serializeDates(spec, child, out[k]);
    });
    return out;
  }
  return value;
}

// Las listas principales (mensajes, productos…) empiezan con un elemento listo para llenar.
function seedBody(spec, schema) {
  const s = resolveRef(spec, schema);
  const out = {};
  Object.entries(s?.properties || {}).forEach(([k, child]) => {
    const c = resolveRef(spec, child);
    if (c.type === 'array' && resolveRef(spec, c.items).properties) out[k] = [{}];
  });
  return out;
}
