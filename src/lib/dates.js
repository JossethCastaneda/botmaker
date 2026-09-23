import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { dateToLocalInput } from './format';

// Periodos rápidos para los filtros de fecha.
export const PRESETS = [
  { id: 'auto', label: 'Automático', range: () => null },
  { id: 'today', label: 'Hoy', range: (n) => [startOfDay(n), n] },
  { id: 'yesterday', label: 'Ayer', range: (n) => [startOfDay(subDays(n, 1)), endOfDay(subDays(n, 1))] },
  { id: '7d', label: 'Últimos 7 días', range: (n) => [subDays(n, 7), n] },
  { id: '30d', label: 'Últimos 30 días', range: (n) => [subDays(n, 30), n] },
  { id: 'month', label: 'Este mes', range: (n) => [startOfMonth(n), n] },
  { id: 'lastMonth', label: 'Mes pasado', range: (n) => [startOfMonth(subMonths(n, 1)), endOfMonth(subMonths(n, 1))] },
];

export function presetValues(presetId) {
  const p = PRESETS.find((x) => x.id === presetId);
  const r = p?.range(new Date());
  return r ? { from: dateToLocalInput(r[0]), to: dateToLocalInput(r[1]) } : { from: '', to: '' };
}
