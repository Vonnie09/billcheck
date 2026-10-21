/* Text, money and status formatting */
import { CURRENCY, LOCALE, METHODS } from '../../../config/settings.js';
import { parseISO, today } from './dates.js';

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

/** Escape text before putting it into HTML. */
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const fmtMoney = n => CURRENCY + Number(n).toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (iso, opts = { month: 'short', day: 'numeric' }) => parseISO(iso).toLocaleDateString('en-US', opts);
export const fmtLong = iso => {
  const sameYear = parseISO(iso).getFullYear() === today().getFullYear();
  return fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
};

/** "2 days late", "Due today", "In 5 days" */
export const statusText = d => d < 0 ? `${plural(-d, 'day')} late` : d === 0 ? 'Due today' : d === 1 ? 'Due tomorrow' : `In ${d} days`;
export const pillClass = d => d < 0 ? 'is-overdue' : d <= 3 ? 'is-soon' : '';
export const methodName = m => METHODS[m] || 'Other';
