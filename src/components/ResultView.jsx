import { Fragment, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Download, ChevronDown, ChevronRight, Search, Clock, Copy, RefreshCw, Loader2, KeyRound, Inbox } from 'lucide-react';
import { labelFor } from '../data/labels';
import { formatValue, flattenRow, columnsOf, columnLabel, extractRows, toCsv, downloadFile, slug } from '../lib/format';
import { Collapsible } from './ui';

const PAGE = 50;

export default function ResultView({ op, result, rows, onLoadMore, onDownloadAll, paging, onReconnect }) {
  const meta = (
    <p className="result-meta">
      <Clock size={14} aria-hidden="true" /> Tardó {(result.ms / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} segundos · {result.at} (hora CDMX)
    </p>
  );

  if (!result.ok) {
    return (
      <section className="card result result-error" aria-live="polite">
        <div className="result-head">
          <XCircle size={28} aria-hidden="true" />
          <div>
            <h3>{result.error.title}</h3>
            <p>{result.error.hint}</p>
          </div>
        </div>
        {result.error.detail && <p className="result-detail">Mensaje de Botmaker: “{result.error.detail}”</p>}
        {result.error.reconnect && (
          <button type="button" className="btn btn-primary" onClick={onReconnect}><KeyRound size={16} /> Revisar mi clave de acceso</button>
        )}
        {meta}
        <TechnicalDetails result={result} />
      </section>
    );
  }

  const isRead = op.method === 'GET';
  const { rows: extracted } = extractRows(result.data);
  const list = rows || extracted;
  const hasBody = result.data !== undefined && result.data !== null && result.data !== '' &&
    !(typeof result.data === 'object' && Object.keys(result.data).length === 0);

  return (
    <section className="card result result-ok" aria-live="polite">
      {!isRead && (
        <div className="result-head">
          <CheckCircle2 size={28} aria-hidden="true" />
          <div>
            <h3>{result.status === 202 ? '¡Recibido! Botmaker lo está procesando' : '¡Listo! Se realizó correctamente'}</h3>
            <p>
              {result.status === 202
                ? 'La acción se completará en unos momentos. No necesitas hacer nada más.'
                : `“${op.name}” se completó con éxito.`}
            </p>
          </div>
        </div>
      )}
      {isRead && <h3 className="result-title">Resultado</h3>}
      {meta}

      {list ? (
        <DataTable
          rows={list}
          filename={`${slug(op.name)}.csv`}
          paging={paging}
          onLoadMore={onLoadMore}
          onDownloadAll={onDownloadAll}
        />
      ) : hasBody ? (
        typeof result.data === 'object' ? <KeyValue data={result.data} /> : <p className="result-text">{String(result.data)}</p>
      ) : (
        isRead && <Empty />
      )}

      <TechnicalDetails result={result} />
    </section>
  );
}

function Empty() {
  return (
    <div className="empty-result">
      <Inbox size={36} aria-hidden="true" />
      <p><strong>No encontramos resultados.</strong></p>
      <p>Prueba con otro periodo de fechas o quita algunos filtros.</p>
    </div>
  );
}

// ─── Tabla ─────────────────────────────────────────────────────────────────
export function DataTable({ rows, filename, paging, onLoadMore, onDownloadAll, compact }) {
  const [filter, setFilter] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [expanded, setExpanded] = useState(null);

  const flat = useMemo(() => rows.map((r) => flattenRow(r)), [rows]);
  const cols = useMemo(() => columnsOf(flat), [flat]);
  const visibleCols = compact ? cols.slice(0, 6) : cols.slice(0, 8);

  const filteredIdx = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const idx = flat.map((_, i) => i);
    if (!f) return idx;
    return idx.filter((i) => Object.entries(flat[i]).some(([k, v]) => formatValue(v, k).toLowerCase().includes(f)));
  }, [flat, filter]);

  if (rows.length === 0) return <Empty />;

  return (
    <div className="data-table-wrap">
      {!compact && (
        <div className="table-toolbar">
          <p className="count"><strong>{rows.length.toLocaleString('es-MX')}</strong> {rows.length === 1 ? 'resultado' : 'resultados'}{paging?.hasMore ? ' (hay más)' : ''}</p>
          <div className="search-box small">
            <Search size={15} aria-hidden="true" />
            <input type="search" className="input" placeholder="Buscar en los resultados…" aria-label="Buscar en los resultados"
              value={filter} onChange={(e) => { setFilter(e.target.value); setShown(PAGE); }} />
          </div>
          <div className="toolbar-actions">
            <button type="button" className="btn btn-secondary" onClick={() => downloadFile(toCsv(rows), filename)}>
              <Download size={16} /> Descargar Excel
            </button>
            {paging?.hasMore && (
              <>
                <button type="button" className="btn btn-secondary" onClick={onLoadMore} disabled={paging.loading}>
                  {paging.loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />} Cargar más
                </button>
                <button type="button" className="btn btn-primary" onClick={onDownloadAll} disabled={paging.loading}>
                  <Download size={16} /> Descargar todo
                </button>
              </>
            )}
          </div>
          {paging?.progress && <p className="progress-note" role="status"><Loader2 size={14} className="spin" /> {paging.progress}</p>}
        </div>
      )}
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de resultados">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Ver detalle</span></th>
              {visibleCols.map((c) => <th key={c} scope="col">{columnLabel(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredIdx.slice(0, shown).map((i) => (
              <Fragment key={i}>
                <tr className={expanded === i ? 'expanded' : ''}>
                  <td>
                    <button type="button" className="icon-btn" aria-expanded={expanded === i}
                      aria-label={expanded === i ? 'Ocultar detalle' : 'Ver detalle completo'}
                      onClick={() => setExpanded(expanded === i ? null : i)}>
                      {expanded === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  {visibleCols.map((c) => <td key={c}>{formatValue(flat[i][c], c.split('.').pop())}</td>)}
                </tr>
                {expanded === i && (
                  <tr className="detail-row">
                    <td colSpan={visibleCols.length + 1}><KeyValue data={rows[i]} /></td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {cols.length > visibleCols.length && (
        <p className="table-note">Se muestran las columnas principales. Toca ▸ para ver todos los datos de una fila, o descarga el Excel para verlo completo.</p>
      )}
      {filteredIdx.length > shown && (
        <button type="button" className="btn btn-secondary" onClick={() => setShown(shown + PAGE)}>
          Mostrar {Math.min(PAGE, filteredIdx.length - shown)} más ({filteredIdx.length - shown} restantes)
        </button>
      )}
      {filter && filteredIdx.length === 0 && <p className="table-note">Nada coincide con “{filter}”.</p>}
    </div>
  );
}

// ─── Ficha de un registro ──────────────────────────────────────────────────
export function KeyValue({ data, depth = 0 }) {
  if (data === null || typeof data !== 'object') return <p>{formatValue(data)}</p>;
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (entries.length === 0) return <p className="table-note">Sin datos.</p>;
  const simple = entries.filter(([, v]) => typeof v !== 'object' || (Array.isArray(v) && v.every((x) => typeof x !== 'object')));
  const complex = entries.filter((e) => !simple.includes(e));
  return (
    <div className="kv">
      {simple.length > 0 && (
        <dl className="kv-grid">
          {simple.map(([k, v]) => (
            <div key={k} className="kv-item">
              <dt>{labelFor(k)}</dt>
              <dd>{formatValue(v, k)}</dd>
            </div>
          ))}
        </dl>
      )}
      {complex.map(([k, v]) => (
        <Collapsible key={k} title={labelFor(k)} subtitle={Array.isArray(v) ? `${v.length} elementos` : undefined} defaultOpen={depth === 0 && complex.length <= 2}>
          {Array.isArray(v) ? <DataTable rows={v} compact /> : <KeyValue data={v} depth={depth + 1} />}
        </Collapsible>
      ))}
    </div>
  );
}

// ─── Datos técnicos (solo para soporte) ────────────────────────────────────
function TechnicalDetails({ result }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify({ estado: result.status, respuesta: result.data }, null, 2);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Collapsible title="Detalles técnicos" subtitle="Solo si soporte te los pide">
      <button type="button" className="btn btn-secondary" onClick={copy}><Copy size={16} /> {copied ? '¡Copiado!' : 'Copiar para enviar a soporte'}</button>
      <pre className="code-block">{text.length > 200000 ? `${text.slice(0, 200000)}\n…` : text}</pre>
    </Collapsible>
  );
}
