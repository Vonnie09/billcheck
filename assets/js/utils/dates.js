/* Date helpers. Dates are stored as "YYYY-MM-DD" strings in local time. */

const pad = n => String(n).padStart(2, '0');

export const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Add months, clamping to the last day (Jan 31 + 1 month = Feb 28/29). */
export const addMonths = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(d.getDate(), last));
  return x;
};

/** Days from today until the date (negative = in the past). */
export const daysUntil = iso => Math.round((parseISO(iso) - today()) / 86400000);
