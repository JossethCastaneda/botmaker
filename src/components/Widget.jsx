import { enumLabel } from '../data/help';
import { isDateTime, isMonth } from '../lib/spec';
import LookupSelect from './LookupSelect';
import { TagInput, YesNo } from './ui';
import DateTimeWidget from './DateTimeWidget';

// Opciones fijas que la API describe solo en texto.
const IMPLICIT_ENUMS = {
  'timestamp-precision': ['seconds', 'milliseconds'],
  availability: ['IN_STOCK', 'OUT_OF_STOCK'],
};

function enumOf(name, schema) {
  return schema?.enum || IMPLICIT_ENUMS[name] || null;
}

// Elige el control adecuado (desplegable, Sí/No, calendario, número, texto…) según el tipo de dato.
export default function Widget({ name, schema = {}, value, onChange, lookup, token, deps, id, invalid, placeholder, requiredEnum, isFilter }) {
  const common = { id, 'aria-invalid': invalid || undefined };

  if (lookup) {
    return (
      <LookupSelect
        lookupKey={lookup}
        token={token}
        deps={deps}
        value={value}
        onChange={onChange}
        multiple={schema.type === 'array'}
        id={id}
        invalid={invalid}
        isFilter={isFilter}
      />
    );
  }

  if (schema.type === 'boolean') {
    return <YesNo id={id} value={value} onChange={onChange} />;
  }

  const options = enumOf(name, schema);
  if (options) {
    return (
      <select {...common} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">{requiredEnum ? '— Elige una opción —' : (isFilter ? '— Cualquiera —' : '— Sin indicar —')}</option>
        {options.map((o) => <option key={o} value={o}>{enumLabel(o)}</option>)}
      </select>
    );
  }

  if (schema.type === 'array') {
    const itemEnum = schema.items?.enum;
    if (itemEnum) {
      const selected = value || [];
      return (
        <div className="check-list" role="group" id={id}>
          {itemEnum.map((o) => (
            <label key={o} className="check-item">
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={() => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])}
              />
              <span>{enumLabel(o)}</span>
            </label>
          ))}
        </div>
      );
    }
    return <TagInput id={id} value={value || []} onChange={onChange} placeholder={placeholder} />;
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    return (
      <input
        {...common}
        type="number"
        inputMode="decimal"
        className="input"
        min={schema.minimum}
        max={schema.maximum}
        step={schema.type === 'integer' ? 1 : 'any'}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }

  if (isMonth(schema, name)) {
    return <input {...common} type="month" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }

  if (isDateTime(schema)) {
    return <DateTimeWidget id={id} value={value} onChange={onChange} disabled={invalid} />;
  }

  const long = /^(text|description|html|content|contentMarkDown|body|notes|userNotes)$/.test(name);
  if (long) {
    return <textarea {...common} className="input" rows={4} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
  }

  const type = /email/i.test(name) && !/s$/.test(name) ? 'email' : /url|link/i.test(name) ? 'url' : 'text';
  return <input {...common} type={type} className="input" value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
