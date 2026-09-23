import { useEffect, useState } from 'react';
import { callApi } from './api';
import { extractRows } from './format';
import { enumLabel } from '../data/help';

// Listas desplegables que se llenan solas consultando Botmaker.
// "value" es lo que se envía; "label" es lo que ve el usuario.
const join = (...parts) => parts.filter(Boolean).join(' · ');

export const LOOKUPS = {
  channel: {
    noun: 'canal',
    path: '/channels',
    value: (c) => c.id,
    label: (c) => join(c.name || c.id, enumLabel(c.platform), c.active === false ? 'inactivo' : ''),
  },
  agent: {
    noun: 'agente',
    path: '/agents',
    value: (a) => a.id,
    label: (a) => join(a.name || a.alias, a.email),
  },
  agentEmail: {
    noun: 'agente',
    path: '/agents',
    value: (a) => a.email,
    label: (a) => join(a.name || a.alias, a.email),
  },
  role: {
    noun: 'rol',
    path: '/roles',
    value: (r) => r.name || r.id,
    label: (r) => r.name || r.id,
    extra: ['ADMIN', 'CONFIGURATOR', 'SUPERVISOR', 'OPERATOR'].map((v) => ({ value: v, label: enumLabel(v) })),
  },
  roleId: {
    noun: 'rol',
    path: '/roles',
    value: (r) => r.id,
    label: (r) => r.name || r.id,
  },
  queue: {
    noun: 'cola de atención',
    path: '/attention-queues',
    value: (q) => q.id,
    label: (q) => q.name || q.id,
  },
  catalog: {
    noun: 'catálogo',
    path: '/ecommerce/catalogs',
    value: (c) => c.id,
    label: (c) => c.title || c.id,
  },
  category: {
    noun: 'categoría',
    path: '/ecommerce/catalogs/{catalogId}/categories',
    needs: 'catalogId',
    value: (c) => c.code,
    label: (c) => join(c.title, c.code),
  },
  product: {
    noun: 'producto',
    path: '/ecommerce/catalogs/{catalogId}/products',
    needs: 'catalogId',
    value: (p) => p.sku,
    label: (p) => join(p.title, p.sku),
  },
  store: {
    noun: 'sucursal',
    path: '/ecommerce/catalogs/{catalogId}/stores',
    needs: 'catalogId',
    value: (s) => s.code,
    label: (s) => join(s.name, s.code),
  },
  zone: {
    noun: 'zona',
    path: '/ecommerce/catalogs/{catalogId}/zones',
    needs: 'catalogId',
    value: (z) => z.code,
    label: (z) => join(z.description, z.code),
  },
  template: {
    noun: 'plantilla',
    path: '/whatsapp/templates',
    value: (t) => t.name,
    label: (t) => join(t.name, enumLabel(t.state)),
  },
  intent: {
    noun: 'respuesta del bot',
    path: '/intents',
    value: (i) => i.name || i.id,
    label: (i) => i.name || i.id,
  },
  webhook: {
    noun: 'webhook',
    path: '/webhooks',
    value: (w) => w.id,
    label: (w) => join(w.url, w.active === false ? 'inactivo' : ''),
  },
  constant: {
    noun: 'dato fijo',
    path: '/constants',
    value: (c) => c.id,
    label: (c) => join(c.name, c.value),
  },
  waNumber: {
    noun: 'número',
    path: '/whatsapp/accounts',
    value: (a) => a.number,
    label: (a) => join(a.number, a.alias),
  },
  campaign: {
    noun: 'campaña',
    path: '/notifications/campaigns',
    value: (c) => c.name,
    label: (c) => c.name,
  },
};

// ¿Qué lista corresponde a este campo en esta acción?
export function lookupFor(name, opPath, inBody = false) {
  // Al crear productos el código (SKU) es nuevo: se escribe, no se elige.
  if (inBody && name === 'sku' && opPath.endsWith('/products')) return null;
  // Al conectar un número nuevo, el número se escribe.
  if (name === 'number' && !opPath.includes('{number}')) return null;
  if (name === 'id' || name === 'idOrEmail') {
    if (inBody) return null;
    if (opPath.startsWith('/agents/')) return 'agent';
    if (opPath.startsWith('/channels/')) return 'channel';
    if (opPath.startsWith('/constants/')) return 'constant';
    if (opPath.startsWith('/attention-queues')) return 'queue';
    if (opPath.startsWith('/webhooks/')) return 'webhook';
    return null;
  }
  if (name === 'idOrName') {
    if (opPath.startsWith('/intents/')) return 'intent';
    if (opPath.startsWith('/roles/')) return 'role';
    if (opPath.startsWith('/whatsapp/templates/')) return 'template';
    return null;
  }
  if (name === 'code' && opPath.includes('/stores/')) return 'store';
  if (name === 'role' && opPath.startsWith('/agents')) return 'role';
  const map = {
    'channel-id': 'channel', channelId: 'channel', 'channel-ids': 'channel', channelsIds: 'channel', chatChannelId: 'channel',
    'agent-ids': 'agent', operatorsIds: 'agent', agentId: 'agent',
    'agent-email': 'agentEmail', assignedConsoleUserEmail: 'agentEmail',
    rolesIds: 'roleId',
    queues: 'queue', queue: 'queue', queueId: 'queue', allowedTransferQueues: 'queue', allowedQueues: 'queue',
    catalogId: 'catalog',
    categoryCode: 'category', parentCategoryCode: 'category',
    sku: 'product', skus: 'product',
    zoneCode: 'zone', zonesCode: 'zone', attachedZoneCodes: 'zone',
    attachedStores: 'store',
    intentIdOrName: 'intent', postActionIntentIdOrName: 'intent',
    webhookId: 'webhook',
    number: 'waNumber', phoneLineNumber: 'waNumber', phoneLinesNumbers: 'waNumber',
    'notification-name': 'campaign',
  };
  return map[name] || null;
}

// ─── Descarga con memoria (una sola consulta por lista y clave) ────────────
const cache = new Map();

async function fetchLookup(def, token, deps) {
  const path = def.needs ? def.path.replace(`{${def.needs}}`, encodeURIComponent(deps[def.needs])) : def.path;
  const cacheKey = `${token}|${path}`;
  if (!cache.has(cacheKey)) {
    const load = async () => {
      let res = await callApi({ path, token });
      if (res.status === 429) {
        // Botmaker pide esperar: reintentamos una vez tras unos segundos.
        await new Promise((r) => setTimeout(r, 3000));
        res = await callApi({ path, token });
      }
      return res;
    };
    cache.set(cacheKey, load().then((res) => {
      if (!res.ok) {
        cache.delete(cacheKey);
        // Aunque falle la consulta, las opciones fijas (p. ej. roles básicos) siguen disponibles.
        return def.extra ? { options: def.extra } : { error: res.error };
      }
      const { rows } = extractRows(res.data);
      const seen = new Set();
      const options = (rows || [])
        .map((item) => ({ value: def.value(item), label: def.label(item) }))
        .filter((o) => o.value && !seen.has(o.value) && seen.add(o.value));
      return { options: [...(def.extra || []), ...options] };
    }));
  }
  return cache.get(cacheKey);
}

export function clearLookupCache() {
  cache.clear();
}

export function useLookup(lookupKey, token, deps = {}) {
  const def = LOOKUPS[lookupKey];
  const depValue = def?.needs ? deps[def.needs] : '';
  const [state, setState] = useState({ loading: false, options: [], error: null, waiting: false });

  useEffect(() => {
    if (!def) return undefined;
    if (!token) {
      setState({ loading: false, options: [], error: null, waiting: false, disconnected: true });
      return undefined;
    }
    if (def.needs && !depValue) {
      setState({ loading: false, options: [], error: null, waiting: true });
      return undefined;
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true, waiting: false, error: null, disconnected: false }));
    fetchLookup(def, token, deps).then((r) => {
      if (!alive) return;
      setState({ loading: false, options: r.options || [], error: r.error || null, waiting: false });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupKey, token, depValue]);

  return { ...state, def };
}
