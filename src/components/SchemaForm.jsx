import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { labelFor } from '../data/labels';
import { HELP, cleanDescription } from '../data/help';
import { resolveRef, isChatReference } from '../lib/spec';
import { lookupFor } from '../lib/lookups';
import Widget from './Widget';
import LookupSelect from './LookupSelect';
import { Collapsible, Field } from './ui';

const REQUIRED_MSG = 'Este dato es obligatorio.';

// Campos poco usados que siempre van dentro de "Más opciones".
const ADVANCED_FIELDS = new Set(['subject', 'html', 'webhookPayload', 'clientPayload', 'postActionIntentIdOrName', 'additionalInfo', 'creationTime', 'priceAsString', 'salePriceAsString']);

// Nombre en singular para cada elemento de una lista ("Mensaje 1", "Producto 2"…).
const SINGULAR = {
  messages: 'Mensaje', products: 'Producto', buttons: 'Botón', chats: 'Conversación', items: 'Elemento',
  categories: 'Categoría', stores: 'Sucursal', zones: 'Zona', variants: 'Variante', options: 'Opción',
  contacts: 'Contacto', agents: 'Agente', rows: 'Fila', sections: 'Sección', salePeriods: 'Periodo de oferta',
  values: 'Valor', fieldValues: 'Campo', attachments: 'Adjunto', inventory: 'Producto', priceSchemas: 'Lista de precios',
};
const keyOf = (path) => path.join('.');

function exampleOf(schema) {
  const ex = schema?.example;
  if (ex === undefined || ex === null || typeof ex === 'object') return undefined;
  const s = String(ex);
  return s.length > 60 ? undefined : `Ej.: ${s}`;
}

function helpFor(name, schema) {
  if (HELP[name]) return { help: HELP[name], original: false };
  const d = cleanDescription(schema?.description);
  return d ? { help: d, original: true } : { help: null, original: false };
}

const isComplex = (s) =>
  !!(s.properties || s.oneOf || isChatReference(s) ||
    (s.type === 'object' && s.additionalProperties) ||
    (s.type === 'array' && (s.items?.properties || s.items?.$ref)));

// Formulario generado automáticamente a partir de la descripción de la API.
// Así el usuario llena cajas y desplegables en lugar de escribir JSON.
export default function SchemaForm({ ctx, schema, value, onChange, path = [] }) {
  const s = resolveRef(ctx.spec, schema);
  const obj = value || {};
  const set = (key, v) => onChange({ ...obj, [key]: v });

  if (isChatReference(s)) {
    return <ChatRefField ctx={ctx} value={obj} onChange={onChange} path={path} />;
  }

  if (s.type === 'object' && s.additionalProperties && !s.properties) {
    return <KeyValueEditor schema={s} value={obj} onChange={onChange} />;
  }

  if (s.oneOf && !s.properties) {
    return <OneOfField ctx={ctx} schema={s} value={obj} onChange={onChange} path={path} />;
  }

  const required = new Set(s.required || []);
  const entries = Object.entries(s.properties || {})
    .map(([k, v]) => [k, resolveRef(ctx.spec, v)])
    .filter(([, v]) => !v.readOnly);

  const simple = entries.filter(([, v]) => !isComplex(v));
  const complex = entries.filter(([, v]) => isComplex(v));
  const simpleRequired = simple.filter(([k]) => required.has(k));
  const optionalAll = simple.filter(([k]) => !required.has(k));
  // Si hay muchos campos opcionales, se guardan en un desplegable para no abrumar.
  const hideOptional = optionalAll.length > 6 && simpleRequired.length > 0;
  const simpleOptional = hideOptional ? optionalAll : optionalAll.filter(([k]) => !ADVANCED_FIELDS.has(k));
  const advanced = hideOptional ? [] : optionalAll.filter(([k]) => ADVANCED_FIELDS.has(k));

  const renderSimple = ([key, child]) => (
    <SimpleField key={key} ctx={ctx} name={key} schema={child} required={required.has(key)}
      value={obj[key]} onChange={(v) => set(key, v)} path={[...path, key]} />
  );

  return (
    <div className="schema-form">
      {(simpleRequired.length > 0 || (!hideOptional && simpleOptional.length > 0)) && (
        <div className="form-grid">
          {simpleRequired.map(renderSimple)}
          {!hideOptional && simpleOptional.map(renderSimple)}
        </div>
      )}
      {hideOptional && (
        <Collapsible title="Más opciones" subtitle={`${simpleOptional.length} datos opcionales`}>
          <div className="form-grid">{simpleOptional.map(renderSimple)}</div>
        </Collapsible>
      )}
      {advanced.length > 0 && (
        <Collapsible title="Más opciones" subtitle="Casi nunca se usan; puedes dejarlas vacías">
          <div className="form-grid">{advanced.map(renderSimple)}</div>
        </Collapsible>
      )}
      {complex.map(([key, child]) => {
        const isReq = required.has(key);
        const help = HELP[key];
        const missingHere = ctx.missing.has(keyOf([...path, key]));
        return (
          <Collapsible
            key={key}
            title={<>{labelFor(key, ctx.opPath)}{isReq ? <span className="req"> *</span> : <span className="optional"> (opcional)</span>}</>}
            subtitle={help ? help.split('\n')[0].slice(0, 140) : undefined}
            defaultOpen={isReq || isChatReference(child) || (complex.length <= 3 && !ADVANCED_FIELDS.has(key))}
            tone={missingHere ? 'error' : undefined}
          >
            {child.type === 'array'
              ? <ArrayOfObjects ctx={ctx} name={key} schema={child} value={obj[key]} onChange={(v) => set(key, v)} path={[...path, key]} />
              : <SchemaForm ctx={ctx} schema={child} value={obj[key]} onChange={(v) => set(key, v)} path={[...path, key]} />}
            {missingHere && <p className="field-error" role="alert">{child.type === 'array' ? 'Agrega al menos un elemento.' : 'Completa esta sección.'}</p>}
          </Collapsible>
        );
      })}
    </div>
  );
}

function SimpleField({ ctx, name, schema, required, value, onChange, path }) {
  const id = useId();
  const { help, original } = helpFor(name, schema);
  const lookup = lookupFor(name, ctx.opPath, true);
  const invalid = ctx.missing.has(keyOf(path));
  const wide = /^(text|description|html|content|contentMarkDown|body|notes)$/.test(name) || schema.type === 'array';
  return (
    <Field label={labelFor(name, ctx.opPath)} required={required} help={help} helpIsOriginal={original}
      htmlFor={id} error={invalid ? REQUIRED_MSG : null} wide={wide}>
      <Widget name={name} schema={schema} value={value} onChange={onChange} lookup={lookup}
        token={ctx.token} deps={ctx.deps} id={id} invalid={invalid} placeholder={exampleOf(schema)} requiredEnum={required} />
    </Field>
  );
}

// ─── Lista de elementos (mensajes, productos, botones…) ────────────────────
function ArrayOfObjects({ ctx, name, schema, value, onChange, path }) {
  const items = value || [];
  const itemSchema = resolveRef(ctx.spec, schema.items);
  const noun = labelFor(name, ctx.opPath).toLowerCase();
  const singular = SINGULAR[name] || labelFor(name, ctx.opPath);
  const update = (i, v) => onChange(items.map((it, j) => (j === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div className="array-list">
      {items.length === 0 && <p className="hint-box">Todavía no agregas ningún elemento en “{noun}”.</p>}
      {items.map((item, i) => (
        <div key={i} className="array-item">
          <div className="array-item-head">
            <strong>{singular} {i + 1}</strong>
            <button type="button" className="btn btn-ghost-danger" onClick={() => remove(i)} aria-label={`Quitar elemento ${i + 1}`}>
              <Trash2 size={16} /> Quitar
            </button>
          </div>
          <SchemaForm ctx={ctx} schema={itemSchema} value={item} onChange={(v) => update(i, v)} path={[...path, i]} />
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => onChange([...items, {}])}>
        <Plus size={16} /> Agregar {items.length ? 'otro' : ''} {singular.toLowerCase()}
      </button>
    </div>
  );
}

// ─── Nombre → valor (variables, etiquetas…) ────────────────────────────────
function KeyValueEditor({ schema, value, onChange }) {
  const valueType = resolveRef({}, schema.additionalProperties)?.type;
  const rows = value.__rows || Object.entries(value).filter(([k]) => !k.startsWith('__'));
  const emit = (next) => {
    const out = { __rows: next };
    next.forEach(([k, v]) => { if (k.trim()) out[k.trim()] = v; });
    onChange(out);
  };
  return (
    <div className="kv-list">
      {rows.map(([k, v], i) => (
        <div key={i} className="kv-row">
          <input className="input" placeholder="Nombre (ej.: ciudad)" aria-label="Nombre" value={k}
            onChange={(e) => emit(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
          {valueType === 'boolean' ? (
            <select className="input" aria-label="Valor" value={v === false ? 'false' : 'true'}
              onChange={(e) => emit(rows.map((r, j) => (j === i ? [r[0], e.target.value === 'true'] : r)))}>
              <option value="true">Prender (Sí)</option>
              <option value="false">Apagar (No)</option>
            </select>
          ) : (
            <input className="input" placeholder="Valor (ej.: Monterrey)" aria-label="Valor" value={v ?? ''}
              onChange={(e) => emit(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
          )}
          <button type="button" className="icon-btn danger" aria-label="Quitar fila" onClick={() => emit(rows.filter((_, j) => j !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => emit([...rows, ['', valueType === 'boolean' ? true : '']])}>
        <Plus size={16} /> Agregar dato
      </button>
    </div>
  );
}

// ─── Una de varias formas posibles ─────────────────────────────────────────
function OneOfField({ ctx, schema, value, onChange, path }) {
  const options = schema.oneOf.map((o) => resolveRef(ctx.spec, o)).filter((o) => o.properties);
  const name = useId();
  if (options.length === 0) return <p className="hint-box">Este dato no necesita información adicional.</p>;
  const chosen = value.__option ?? 0;
  const describe = (o, i) => o.title || `Opción ${i + 1}: ${Object.keys(o.properties).map((k) => labelFor(k)).slice(0, 3).join(', ')}`;
  return (
    <div>
      {options.length > 1 && (
        <fieldset className="radio-cards">
          <legend>Elige una opción</legend>
          {options.map((o, i) => (
            <label key={i} className={`radio-card ${chosen === i ? 'active' : ''}`}>
              <input type="radio" name={name} checked={chosen === i} onChange={() => onChange({ __option: i })} />
              {describe(o, i)}
            </label>
          ))}
        </fieldset>
      )}
      <SchemaForm ctx={ctx} schema={options[chosen]} value={value} onChange={(v) => onChange({ ...v, __option: chosen })} path={path} />
    </div>
  );
}

// ─── ¿A qué conversación? ──────────────────────────────────────────────────
function ChatRefField({ ctx, value, onChange, path }) {
  const name = useId();
  const channelId = useId();
  const contactId = useId();
  const chatIdId = useId();
  const mode = value.__mode || 'contact';
  const missing = ctx.missing.has(keyOf(path));
  return (
    <div className="chat-ref">
      <fieldset className="radio-cards">
        <legend>¿Cómo quieres indicar la conversación?</legend>
        <label className={`radio-card ${mode === 'contact' ? 'active' : ''}`}>
          <input type="radio" name={name} checked={mode === 'contact'} onChange={() => onChange({ __mode: 'contact' })} />
          <span><strong>Con el canal y el número del cliente</strong><small>Lo más común para WhatsApp.</small></span>
        </label>
        <label className={`radio-card ${mode === 'chat' ? 'active' : ''}`}>
          <input type="radio" name={name} checked={mode === 'chat'} onChange={() => onChange({ __mode: 'chat' })} />
          <span><strong>Con el código de la conversación</strong><small>Si lo copiaste del enlace en Botmaker.</small></span>
        </label>
      </fieldset>
      {mode === 'contact' ? (
        <div className="form-grid">
          <Field label="Canal" required help={HELP.channelId} htmlFor={channelId} error={missing && !value.channelId ? REQUIRED_MSG : null}>
            <LookupSelect lookupKey="channel" token={ctx.token} deps={ctx.deps} id={channelId}
              value={value.channelId} onChange={(v) => onChange({ ...value, channelId: v })} invalid={missing && !value.channelId} />
          </Field>
          <Field label="Número o ID del cliente" required help={HELP.contactId} htmlFor={contactId} error={missing && !value.contactId ? REQUIRED_MSG : null}>
            <input id={contactId} className="input" inputMode="tel" placeholder="Ej.: 5215512345678" value={value.contactId || ''}
              aria-invalid={(missing && !value.contactId) || undefined}
              onChange={(e) => onChange({ ...value, contactId: e.target.value.replace(/[\s+()-]/g, '') })} />
          </Field>
        </div>
      ) : (
        <Field label="Código de la conversación" required help={HELP.chatId} htmlFor={chatIdId} error={missing ? REQUIRED_MSG : null}>
          <input id={chatIdId} className="input" placeholder="Ej.: ABC123DEF456GHI789JK" value={value.chatId || ''}
            aria-invalid={missing || undefined}
            onChange={(e) => onChange({ ...value, chatId: extractChatId(e.target.value) })} />
        </Field>
      )}
    </div>
  );
}

// Si el usuario pega el enlace completo, nos quedamos solo con el código.
function extractChatId(text) {
  const m = text.match(/#\/(?:chats?\/)?([A-Za-z0-9_-]{8,})/);
  return m ? m[1] : text.trim();
}
