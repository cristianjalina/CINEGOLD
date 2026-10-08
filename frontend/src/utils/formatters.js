export function formatMinutes(minutes) {
  if (!minutes) return 'Duración no disponible';
  return `${minutes} min`;
}

export function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
  }).format(number);
}

export function formatDateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-NI', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatTime(value) {
  if (!value) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${String(Math.trunc(value)).padStart(2, '0')}:00`;
  }
  if (typeof value === 'string') return value.slice(0, 5);
  return new Intl.DateTimeFormat('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
