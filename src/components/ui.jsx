import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Info, Plus, X, AlertTriangle } from 'lucide-react';

// ─── Campo con etiqueta, ayuda ⓘ y mensaje de error ────────────────────────
export function Field({ label, required, help, helpIsOriginal, error, children, htmlFor, wide }) {
  const [open, setOpen] = useState(false);
  const helpId = useId();
  return (
    <div className={`field ${error ? 'has-error' : ''} ${wide ? 'field-wide' : ''}`}>
      <div className="field-label-row">
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required ? <span className="req" aria-label="obligatorio"> *</span> : <span className="optional"> (opcional)</span>}
        </label>
        {help && (
          <button
            type="button"
            className="help-btn"
            aria-expanded={open}
            aria-controls={helpId}
            aria-label={`Ayuda sobre ${label}`}
            onClick={() => setOpen(!open)}
          >
            <Info size={16} />
          </button>
        )}
      </div>
      {help && open && (
        <p id={helpId} className="help-text">
          {help}
          {helpIsOriginal && <span className="help-original"> (texto original de Botmaker)</span>}
        </p>
      )}
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

// ─── Sección desplegable ───────────────────────────────────────────────────
export function Collapsible({ title, subtitle, defaultOpen = false, children, tone, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`collapsible ${open ? 'open' : ''} ${tone ? `tone-${tone}` : ''}`}>
      <button type="button" className="collapsible-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span className="collapsible-title">
          <span>{title}</span>
          {subtitle && <small>{subtitle}</small>}
        </span>
        {badge}
      </button>
      {open && <div id={id} className="collapsible-body">{children}</div>}
    </div>
  );
}

// ─── Sí / No / (sin indicar) ───────────────────────────────────────────────
export function YesNo({ value, onChange, allowEmpty = true, emptyLabel = 'No indicar', id }) {
  const opts = [
    ...(allowEmpty ? [{ v: undefined, label: emptyLabel }] : []),
    { v: true, label: 'Sí' },
    { v: false, label: 'No' },
  ];
  return (
    <div className="segmented" role="radiogroup" id={id}>
      {opts.map((o) => (
        <button
          key={o.label}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          className={value === o.v ? 'active' : ''}
          onClick={() => onChange(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Lista de textos (correos, códigos…) con botón Agregar ─────────────────
export function TagInput({ value = [], onChange, placeholder, id }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft('');
  };
  return (
    <div className="tag-input">
      {value.length > 0 && (
        <ul className="chips">
          {value.map((v) => (
            <li key={v} className="chip">
              {v}
              <button type="button" aria-label={`Quitar ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="tag-input-row">
        <input
          id={id}
          className="input"
          value={draft}
          placeholder={placeholder || 'Escribe y presiona Agregar'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn btn-secondary" onClick={add} disabled={!draft.trim()}>
          <Plus size={16} /> Agregar
        </button>
      </div>
    </div>
  );
}

// ─── Ventana de confirmación ───────────────────────────────────────────────
export function ConfirmDialog({ open, title, children, confirmLabel, tone = 'danger', requireWord, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('');
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      setTyped('');
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const canConfirm = !requireWord || typed.trim().toUpperCase() === requireWord;

  return (
    <dialog ref={dialogRef} className={`dialog tone-${tone}`} aria-labelledby={titleId} onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <div className="dialog-icon"><AlertTriangle size={28} /></div>
      <h2 id={titleId}>{title}</h2>
      <div className="dialog-body">{children}</div>
      {requireWord && (
        <label className="dialog-word">
          <span>Para continuar, escribe <strong>{requireWord}</strong>:</span>
          <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </label>
      )}
      <div className="dialog-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>Cancelar</button>
        <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} disabled={!canConfirm} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
