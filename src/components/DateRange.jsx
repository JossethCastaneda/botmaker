import { useId } from 'react';
import { CalendarDays } from 'lucide-react';
import { PRESETS, presetValues } from '../lib/dates';
import { Field } from './ui';
import { HELP } from '../data/help';
import DateTimeWidget from './DateTimeWidget';

// Periodo de fechas con botones rápidos + calendario.
export default function DateRange({ from, to, preset, onChange, fromRequired, toRequired, errors = {} }) {
  const fromId = useId();
  const toId = useId();
  const pick = (id) => onChange({ ...presetValues(id), preset: id });
  const outOfOrder = from && to && new Date(from) > new Date(to);

  return (
    <div className="date-range field-wide">
      <p className="field-label"><CalendarDays size={16} aria-hidden="true" /> ¿De qué periodo?</p>
      <div className="chip-group" role="radiogroup" aria-label="Periodo">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={preset === p.id}
            className={`chip-btn ${preset === p.id ? 'active' : ''}`}
            onClick={() => pick(p.id)}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={preset === 'custom'}
          className={`chip-btn ${preset === 'custom' ? 'active' : ''}`}
          onClick={() => onChange({ from, to, preset: 'custom' })}
        >
          Elegir fechas
        </button>
      </div>
      {preset === 'auto' && <p className="hint-box">Botmaker usará su periodo automático (normalmente las últimas 24 horas).</p>}
      {preset !== 'auto' && (
        <div className="form-grid">
          <Field label="Desde" required={fromRequired} help={HELP.from} htmlFor={fromId} error={errors.from}>
            <DateTimeWidget id={fromId} value={from}
              onChange={(val) => onChange({ from: val, to, preset: 'custom' })} />
          </Field>
          <Field label="Hasta" required={toRequired} help={HELP.to} htmlFor={toId} error={errors.to || (outOfOrder ? 'La fecha "Hasta" debe ser posterior a "Desde".' : null)}>
            <DateTimeWidget id={toId} value={to}
              onChange={(val) => onChange({ from, to: val, preset: 'custom' })} />
          </Field>
        </div>
      )}
    </div>
  );
}
