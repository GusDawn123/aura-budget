import { parseISO, isValid, format } from 'date-fns';

export function toNumber(value) {
  const num = Number(value);
  return isFinite(num) ? num : 0;
}

export function safeMoney(value) {
  return toNumber(value).toFixed(2);
}

export function safeISODate(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const date = parseISO(value);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

export function safeFormatDate(value, formatStr = 'MMM d, yyyy') {
  const date = safeISODate(value);
  return date ? format(date, formatStr) : 'N/A';
}