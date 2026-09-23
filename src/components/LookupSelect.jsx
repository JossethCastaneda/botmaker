import { useMemo, useState } from 'react';
import { Search, Pencil, List, Loader2 } from 'lucide-react';
import { useLookup } from '../lib/lookups';
import { TagInput } from './ui';

const MANUAL = '__manual__';

// Desplegable que se llena solo con datos de Botmaker (canales, agentes, catálogos…).
// Siempre permite escribir el valor a mano si no aparece en la lista.
export default function LookupSelect({ lookupKey, token, deps, value, onChange, multiple, id, invalid, isFilter }) {
  const { loading, options, error, waiting, disconnected, def } = useLookup(lookupKey, token, deps);
  const [manual, setManual] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? options.filter((o) => `${o.label} ${o.value}`.toLowerCase().includes(f)) : options;
  }, [options, filter]);

  if (waiting) {
    return <p className="hint-box">Primero elige un catálogo arriba y aquí aparecerán las opciones.</p>;
  }

  const noOptions = !loading && (error || options.length === 0);
  const showManual = manual || noOptions;

  if (showManual) {
    return (
      <div className="lookup">
        {multiple ? (
          <TagInput id={id} value={value || []} onChange={onChange} placeholder={`Escribe el código del ${def.noun}`} />
        ) : (
          <input
            id={id}
            className="input"
            aria-invalid={invalid || undefined}
            value={value || ''}
            placeholder={`Escribe el código del ${def.noun}`}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {noOptions ? (
          <p className="lookup-note">
            {disconnected ? `Conecta tu cuenta para elegir el ${def.noun} de una lista, o escríbelo a mano.` : error ? `No pudimos cargar la lista (${error.title.toLowerCase()}). Puedes escribirlo a mano.` : `No encontramos ningún ${def.noun} en tu cuenta. Puedes escribirlo a mano.`}
          </p>
        ) : (
          <button type="button" className="link-btn" onClick={() => setManual(false)}>
            <List size={14} /> Elegir de la lista
          </button>
        )}
      </div>
    );
  }

  const searchBox = options.length > 8 && (
    <div className="search-box small">
      <Search size={15} aria-hidden="true" />
      <input
        type="search"
        className="input"
        placeholder={`Buscar ${def.noun}…`}
        aria-label={`Buscar ${def.noun}`}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
    </div>
  );

  if (multiple) {
    const selected = value || [];
    const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    return (
      <div className="lookup">
        {searchBox}
        <div className="check-list" id={id} role="group">
          {loading && <p className="lookup-note"><Loader2 size={14} className="spin" /> Cargando opciones…</p>}
          {filtered.map((o) => (
            <label key={o.value} className="check-item">
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
          {!loading && filtered.length === 0 && <p className="lookup-note">Nada coincide con “{filter}”.</p>}
        </div>
        <div className="lookup-foot">
          <span>{selected.length ? `${selected.length} seleccionado(s)` : (isFilter ? 'Ninguno seleccionado: se incluyen todos' : 'Ninguno seleccionado')}</span>
          <button type="button" className="link-btn" onClick={() => setManual(true)}><Pencil size={14} /> Escribir a mano</button>
        </div>
      </div>
    );
  }

  const current = value || '';
  const inList = options.some((o) => o.value === current);
  return (
    <div className="lookup">
      {searchBox}
      <select
        id={id}
        className="input"
        aria-invalid={invalid || undefined}
        value={current}
        disabled={loading}
        onChange={(e) => (e.target.value === MANUAL ? setManual(true) : onChange(e.target.value))}
      >
        <option value="">{loading ? 'Cargando opciones…' : `— Elige un ${def.noun} —`}</option>
        {current && !inList && <option value={current}>{current}</option>}
        {filtered.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {!loading && <option value={MANUAL}>✏️ No está en la lista, escribirlo a mano…</option>}
      </select>
    </div>
  );
}
