/* Installment schedule */
import { parseISO, toISO, addDays, addMonths } from './dates.js';

/** Split a total into `count` payments (cent-exact) on a recurring schedule. */
export function buildSchedule(total, firstISO, count, freq) {
  const first = parseISO(firstISO);
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  const extra = cents - base * count;
  return Array.from({ length: count }, (_, i) => {
    const due = freq === 'monthly' ? addMonths(first, i)
      : addDays(first, i * (freq === 'biweekly' ? 14 : 7));
    return { due: toISO(due), amount: (base + (i < extra ? 1 : 0)) / 100, paid: false, paidAt: null, receipt: null };
  });
}
