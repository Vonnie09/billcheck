/* Sample bills shown on the first visit (and after "Reset demo").
   Dates are relative to today, so the demo always looks current. */
import { today, toISO, addDays, addMonths } from '../assets/js/utils/dates.js';
import { buildSchedule } from '../assets/js/utils/schedule.js';
import { uid } from '../assets/js/utils/format.js';

/** Placeholder QR image so the demo has an uploaded payment method. */
function demoQR(seedStr) {
  let h = 7;
  for (const c of seedStr) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const N = 25;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  let cells = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!inFinder(x, y) && rnd() > 0.52) cells += `M${x} ${y}h1v1h-1z`;
  }
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 29 29" shape-rendering="crispEdges"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><g fill="#111827"><path d="${cells}"/>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function seed() {
  const t = today();
  const make = (title, total, first, count, freq, method, paidCount = 0, withQR = false) => {
    const installments = buildSchedule(total, toISO(first), count, freq);
    installments.slice(0, paidCount).forEach(ins => { ins.paid = true; ins.paidAt = ins.due; });
    return { id: uid(), title, total, freq, method, methodImg: withQR ? demoQR(title) : null, createdAt: Date.now(), installments };
  };
  return [
    make('Water bill', 680, addDays(t, -1), 1, 'monthly', 'ewallet', 0, true),
    make('Electricity', 2450.75, addDays(t, 3), 1, 'monthly', 'ewallet', 0, true),
    make('Laptop', 42000, addDays(addMonths(t, -2), 5), 6, 'monthly', 'card', 2),
    make('Apartment rent', 12500, addDays(t, 16), 1, 'monthly', 'bank'),
    make('Streaming plan', 549, addDays(t, 9), 1, 'monthly', 'card'),
    make('Phone (12 months)', 30000, addDays(addMonths(t, -4), 12), 12, 'monthly', 'bank', 4, true),
    make('Internet', 1699, addDays(t, -6), 1, 'monthly', 'autodebit', 1),
  ];
}
