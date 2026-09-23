import axios from 'axios';

// En desarrollo y en "npm run preview", Vite reenvía /api a https://api.botmaker.com/v2.0.
// Al publicar en otro servidor, define VITE_API_BASE con la dirección de tu propio reenvío.
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const BOTMAKER_BASE = 'https://api.botmaker.com/v2.0';

// ─── Clave de acceso guardada en el navegador ──────────────────────────────
const TOKEN_KEY = 'botmaker.token';

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveToken(token, remember) {
  try {
    if (remember && token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Navegador sin almacenamiento (modo privado): la clave dura solo esta sesión.
  }
}

// ─── Llamadas ──────────────────────────────────────────────────────────────
// Convierte una dirección completa de Botmaker (p. ej. el "nextPage" de una respuesta)
// en una dirección que pasa por nuestro reenvío.
export function toProxyUrl(url) {
  if (url.startsWith(BOTMAKER_BASE)) return API_BASE + url.slice(BOTMAKER_BASE.length);
  return url;
}

export async function callApi({ method = 'GET', path, query, body, token, signal }) {
  const qs = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, item));
    else qs.append(k, v);
  });
  const queryString = qs.toString();
  const url = path.startsWith('http')
    ? toProxyUrl(path)
    : `${API_BASE}${path}${queryString ? `?${queryString}` : ''}`;

  const started = performance.now();
  try {
    const res = await axios({
      method,
      url,
      data: body,
      signal,
      headers: { 'access-token': token, 'Content-Type': 'application/json' },
    });
    return { ok: true, status: res.status, data: res.data, ms: performance.now() - started };
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    return {
      ok: false,
      status: err.response?.status ?? 0,
      data: err.response?.data,
      ms: performance.now() - started,
      error: humanizeError(err.response?.status ?? 0, err.response?.data),
    };
  }
}

// ─── Mensajes de error en lenguaje sencillo ────────────────────────────────
export function humanizeError(status, data) {
  const detail = extractApiMessage(data);
  const base = (() => {
    if (status === 0) return {
      title: 'No pudimos conectarnos con Botmaker',
      hint: 'Revisa tu conexión a internet e inténtalo de nuevo en unos segundos.',
    };
    if (status === 400) return {
      title: 'Algún dato no es válido',
      hint: 'Revisa los campos marcados y que las fechas, correos o números estén bien escritos.',
    };
    if (status === 401) return {
      title: 'Tu clave de acceso no es válida o expiró',
      hint: 'Abre "Conexión" (arriba a la derecha) y vuelve a pegar tu clave.',
      reconnect: true,
    };
    if (status === 403) return {
      title: 'Tu clave no tiene permiso para esta acción',
      hint: 'Pide a un administrador de tu cuenta Botmaker que te dé acceso.',
    };
    if (status === 404) return {
      title: 'No encontramos lo que buscas',
      hint: 'Revisa que lo que elegiste o escribiste exista (por ejemplo, el código o el nombre).',
    };
    if (status === 409) return {
      title: 'Ya existe un registro con esos datos',
      hint: 'Usa otro nombre o código, o edita el que ya existe.',
    };
    if (status === 410) return {
      title: 'Esto ya no está disponible',
      hint: 'El elemento fue eliminado o expiró.',
    };
    if (status === 429) return {
      title: 'Demasiadas consultas seguidas',
      hint: 'Espera un minuto y vuelve a intentarlo.',
    };
    if (status >= 500) return {
      title: 'Botmaker tuvo un problema',
      hint: 'No es un error tuyo. Inténtalo de nuevo más tarde.',
    };
    return { title: 'Algo salió mal', hint: 'Inténtalo de nuevo. Si se repite, contacta a soporte.' };
  })();
  return { ...base, detail };
}

function extractApiMessage(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.length < 300 && !data.trim().startsWith('<') ? data : '';
  const msg = data.message || data.error || data.errors?.[0]?.message || data.errors?.[0];
  return typeof msg === 'string' ? msg : '';
}
