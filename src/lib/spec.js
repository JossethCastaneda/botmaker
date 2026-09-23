import { ACTIONS, CATEGORIES, actionKey } from '../data/actions';

// Lista de acciones visibles, a partir del archivo de la API.
export function buildOperations(spec) {
  const ops = [];
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      if (typeof details !== 'object' || !details) return;
      const key = actionKey(method, path);
      const meta = ACTIONS[key] || { cat: 'avanzado', name: details.summary || key, desc: '' };
      if (meta.hidden || details.deprecated) return;
      ops.push({
        key,
        method: method.toUpperCase(),
        path,
        details,
        ...meta,
      });
    });
  });
  const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
  return ops.sort((a, b) => (order[a.cat] - order[b.cat]) || a.name.localeCompare(b.name, 'es'));
}

// ─── Esquemas ──────────────────────────────────────────────────────────────
export function resolveRef(spec, schema, depth = 0) {
  if (!schema || depth > 20) return schema || {};
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    return resolveRef(spec, spec.components?.schemas?.[name], depth + 1);
  }
  if (schema.allOf) {
    const merged = { type: 'object', properties: {}, required: [] };
    schema.allOf.forEach((part) => {
      const r = resolveRef(spec, part, depth + 1);
      Object.assign(merged.properties, r.properties || {});
      merged.required.push(...(r.required || []));
      if (r.description && !merged.description) merged.description = r.description;
    });
    return { ...schema, ...merged, allOf: undefined };
  }
  return schema;
}

export function bodySchemaOf(spec, details) {
  const content = details.requestBody?.content;
  if (!content) return null;
  const media = content['application/json'] || content['*/*'] || Object.values(content)[0];
  if (!media?.schema) return { type: 'object', properties: {} };
  return resolveRef(spec, media.schema);
}

export const isDateTime = (schema) => schema?.format === 'date-time';
export const isMonth = (schema, name) => schema?.format === 'yyyy-MM' || name === 'billingPeriod';

// ¿Es la "referencia a una conversación" (chatId, o canal + contacto)?
export function isChatReference(schema) {
  const opts = schema?.oneOf;
  if (!opts || opts.length !== 2) return false;
  const keys = opts.map((o) => Object.keys(o.properties || {}).sort().join(','));
  return keys.includes('chatId') && keys.includes('channelId,contactId');
}

// ─── Limpieza antes de enviar ──────────────────────────────────────────────
// Quita campos vacíos para no mandar datos que el usuario no llenó.
export function prune(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    const arr = value.map(prune).filter((v) => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      if (k.startsWith('__')) return; // campos internos del formulario
      const p = prune(v);
      if (p !== undefined) out[k] = p;
    });
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

// ─── Validación ────────────────────────────────────────────────────────────
// Devuelve la lista de campos obligatorios vacíos (con su ruta, para marcarlos en rojo).
export function missingInBody(spec, schema, value, path = [], forceRequired = true) {
  const s = resolveRef(spec, schema);
  const missing = [];
  if (isChatReference(s)) {
    const v = value || {};
    if (forceRequired && !v.chatId && !(v.channelId && v.contactId)) {
      missing.push({ path, reason: 'chat' });
    }
    return missing;
  }
  if (s.properties) {
    const obj = value || {};
    const hasAny = prune(obj) !== undefined;
    if (!forceRequired && !hasAny) return missing; // objeto opcional sin llenar: no se exige nada adentro
    (s.required || []).forEach((key) => {
      const child = resolveRef(spec, s.properties[key]);
      if (!child) return;
      if (child.properties || isChatReference(child)) {
        missing.push(...missingInBody(spec, child, obj[key], [...path, key], true));
      } else if (prune(obj[key]) === undefined) {
        missing.push({ path: [...path, key] });
      }
    });
    Object.entries(s.properties).forEach(([key, childSchema]) => {
      const child = resolveRef(spec, childSchema);
      const isRequired = (s.required || []).includes(key);
      if (child.properties && !isRequired) {
        missing.push(...missingInBody(spec, child, obj[key], [...path, key], false));
      }
      if (child.type === 'array' && Array.isArray(obj[key])) {
        const itemSchema = resolveRef(spec, child.items);
        if (itemSchema.properties) {
          obj[key].forEach((item, i) => {
            missing.push(...missingInBody(spec, itemSchema, item, [...path, key, i], false));
          });
        }
      }
    });
  }
  return missing;
}
