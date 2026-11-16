/* Checks every bill before it is shown — from a backup file or from storage — so a damaged or
   crafted file can't crash the app or run code inside it. Bad fields are fixed where possible;
   bills that can't be fixed are skipped. */
import { METHODS, FREQ } from '../../../config/settings.js';
import { uid } from './format.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID = /^[\w-]{1,64}$/;
// Only real image data: "data:image/<type>[;params],<base64 or url-encoded data>" — no quotes, spaces or tags
const SAFE_IMAGE = /^data:image\/[a-z0-9.+-]+(;[a-z0-9=.-]+)*,[A-Za-z0-9+/=%._~*()!'-]*$/i;
const MAX_TITLE = 120;
const MAX_INSTALLMENTS = 120;

const money = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
const date = v => (typeof v === 'string' && ISO_DATE.test(v) ? v : null);
const image = v => (typeof v === 'string' && SAFE_IMAGE.test(v) ? v : null);

/** A safe copy of one bill, or null if it can't be used. */
export function cleanBill(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.installments) || !raw.installments.length) return null;
  if (raw.installments.length > MAX_INSTALLMENTS) return null;

  const installments = [];
  for (const i of raw.installments) {
    const due = date(i?.due);
    const amount = money(i?.amount);
    if (!due || amount === null) return null; // a payment without a real date or amount: skip the bill
    const paid = i.paid === true;
    installments.push({ due, amount, paid, paidAt: paid ? (date(i.paidAt) || due) : null, receipt: image(i.receipt) });
  }

  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, MAX_TITLE) : '';
  const total = money(raw.total);
  const bill = {
    id: typeof raw.id === 'string' && SAFE_ID.test(raw.id) ? raw.id : uid(),
    title: title || 'Untitled bill',
    total: total ?? Math.round(installments.reduce((s, i) => s + i.amount, 0) * 100) / 100,
    freq: Object.hasOwn(FREQ, raw.freq) ? raw.freq : 'monthly',
    method: Object.hasOwn(METHODS, raw.method) ? raw.method : 'cash',
    methodImg: image(raw.methodImg),
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
    installments,
  };
  if (Number.isFinite(raw.deletedAt)) bill.deletedAt = raw.deletedAt;
  return bill;
}

/** Clean a list of bills: drops unusable ones and gives duplicate IDs a new one. */
export function cleanBills(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const bill = cleanBill(raw);
    if (!bill) continue;
    if (seen.has(bill.id)) bill.id = uid();
    seen.add(bill.id);
    out.push(bill);
  }
  return out;
}
