import { formatInTimeZone } from 'date-fns-tz';
import { isValid, parseISO } from 'date-fns';
import { labelFor } from '../data/labels';
import { enumLabel } from '../data/help';

export const TZ = 'America/Mexico_City';

// Hora actual de CDMX para mostrar al usuario.
export const nowCdmx = () => formatInTimeZone(new Date(), TZ, "dd/MM/yyyy HH:mm");

// Fecha del formulario → texto ISO en UTC ("2026-09-23T18:05:00.000Z").
// Botmaker ignora las fechas con desfase horario ("…-06:00") y responde sin datos (204),
// así que siempre se envían en UTC.
export function localInputToIso(v) {
  if (!v) return '';
  const d = new Date(v);
  return isValid(d) ? d.toISOString() : '';
}

// Date → valor para <input type="datetime-local">.
export function dateToLocalInput(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// Formatea un valor de resultado para leerlo fácilmente.
export function formatValue(value, key = '') {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return value.toLocaleString('es-MX');
  if (typeof value === 'string') {
    if (ISO_RE.test(value)) {
      const d = parseISO(value);
      if (isValid(d)) return formatInTimeZone(d, TZ, 'dd/MM/yyyy HH:mm');
    }
    if (/^(state|status|platform|role|priority|availability|actions?|type)$/i.test(key)) return enumLabel(value);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (value.every((v) => typeof v !== 'object' || v === null)) return value.map((v) => formatValue(v, key)).join(', ');
    return `${value.length} ${value.length === 1 ? 'elemento' : 'elementos'}`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return keys.length ? `${keys.length} datos` : '—';
  }
  return String(value);
}

// ─── Tablas ────────────────────────────────────────────────────────────────
// Aplana un objeto un nivel: { chat: { channelId } } → { "chat.channelId": … }
export function flattenRow(row, prefix = '', depth = 0, out = {}) {
  if (row === null || typeof row !== 'object' || Array.isArray(row)) {
    out[prefix || 'valor'] = row;
    return out;
  }
  Object.entries(row).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && depth < 1) flattenRow(v, key, depth + 1, out);
    else out[key] = v;
  });
  return out;
}

export function columnLabel(key) {
  return key.split('.').map((part) => labelFor(part)).join(' › ');
}

export function columnsOf(flatRows) {
  const seen = new Map();
  flatRows.slice(0, 100).forEach((r) => Object.keys(r).forEach((k) => {
    const filled = r[k] !== null && r[k] !== undefined && r[k] !== '';
    seen.set(k, (seen.get(k) || 0) + (filled ? 1 : 0));
  }));
  // Oculta columnas que siempre vienen vacías y pone primero las más fáciles de leer (nombre, título…).
  const rank = (k) => {
    const last = k.split('.').pop();
    if (k.startsWith('variables.')) return 2; // datos personalizados del bot: después de lo principal
    if (/^(contactId|phoneNumber)$/.test(last)) return 1;
    if (/^(name|title|firstName|lastName|alias|displayName|description)$/.test(last)) return 0;
    if (/^(email|number|phone|state|status|platform|active)$/i.test(last)) return 1;
    if (/(^id$|Id$|ids$|token|url$|URL$)/i.test(last)) return 3;
    return 2;
  };
  return [...seen.entries()]
    .filter(([, count]) => count > 0)
    .map(([k], i) => [k, i])
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1])
    .map(([k]) => k);
}

// Busca la lista principal dentro de una respuesta (items, constants, zones…).
export function extractRows(data) {
  if (Array.isArray(data)) return { rows: data, listKey: null };
  if (data && typeof data === 'object') {
    const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));
    if (arrays.length === 1 || (arrays.length > 1 && arrays.find(([k]) => k === 'items'))) {
      const [listKey, rows] = arrays.find(([k]) => k === 'items') || arrays[0];
      return { rows, listKey };
    }
  }
  return { rows: null, listKey: null };
}

// ─── Exportar a Excel (CSV) ────────────────────────────────────────────────
export function toCsv(rows) {
  const flat = rows.map((r) => flattenRow(r));
  const cols = columnsOf(flat);
  const cell = (v, key) => {
    let s;
    if (v === null || v === undefined) s = '';
    else if (Array.isArray(v) && v.every((x) => x === null || typeof x !== 'object')) s = v.join(', ');
    else if (typeof v === 'object') s = JSON.stringify(v);
    else if (typeof v === 'string' && ISO_RE.test(v)) s = formatValue(v, key);
    else if (typeof v === 'boolean') s = v ? 'Sí' : 'No';
    else s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = cols.map((c) => cell(columnLabel(c))).join(',');
  const lines = flat.map((r) => cols.map((c) => cell(r[c], c.split('.').pop())).join(','));
  return '﻿' + [header, ...lines].join('\r\n'); // BOM para que Excel respete acentos
}

export function downloadFile(content, filename, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slug(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 50);
}
