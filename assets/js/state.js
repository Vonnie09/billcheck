/* App data: bills + trash, saved in this browser's localStorage. No backend.
   Demo Mode and Empty State each keep their own bills. */
import { STORAGE_KEYS } from '../../config/settings.js';
import { seed } from '../../config/demoData.js';
import { toast } from '../../components/toast.js';
import { cleanBills } from './utils/cleanBill.js';

export const state = { bills: [], trash: [], mode: 'demo' };

const dataKey = mode => mode === 'empty' ? STORAGE_KEYS.emptyData : STORAGE_KEYS.data;

/** The mode the user had last time (Demo Mode on a first visit). */
export function savedMode() {
  try { return localStorage.getItem(STORAGE_KEYS.mode) === 'empty' ? 'empty' : 'demo'; }
  catch (e) { return 'demo'; }
}

/** A mode's saved { bills, trash } (checked by cleanBills), or null if nothing is saved yet. */
export function readMode(mode) {
  try {
    const raw = localStorage.getItem(dataKey(mode));
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.bills)) return { bills: cleanBills(data.bills), trash: cleanBills(data.trash) };
    }
  } catch (e) { /* treat as empty */ }
  return null;
}

/** Overwrite a mode's saved bills (used when restoring a backup). Throws if storage is full. */
export function writeMode(mode, data) {
  localStorage.setItem(dataKey(mode), JSON.stringify({ bills: data.bills, trash: data.trash || [] }));
}

/** Load a mode's saved bills. First time: sample bills in Demo Mode, nothing in Empty State. */
export function load(mode = state.mode) {
  return readMode(mode) || { bills: mode === 'demo' ? seed() : [], trash: [] };
}

/** Switch to another mode and load its bills. */
export function setMode(mode) {
  state.mode = mode;
  Object.assign(state, load(mode));
  try { localStorage.setItem(STORAGE_KEYS.mode, mode); } catch (e) { /* ignore */ }
}

export function save() {
  try {
    localStorage.setItem(dataKey(state.mode), JSON.stringify({ bills: state.bills, trash: state.trash }));
    return true;
  } catch (e) {
    toast('Browser storage is full. Try a smaller image.');
    return false;
  }
}

/* ---------- queries ---------- */
export const findBill = id => state.bills.find(b => b.id === id);
export const findTrashed = id => state.trash.find(b => b.id === id);
export const isDone = b => b.installments.every(i => i.paid);
export const nextDue = b => (b.installments.find(i => !i.paid) || {}).due || '9999-12-31';

/** Every unpaid payment across all bills, soonest first. */
export const unpaidQueue = () => state.bills
  .flatMap(bill => bill.installments.map((ins, idx) => ({ bill, ins, idx })))
  .filter(x => !x.ins.paid)
  .sort((a, b) => a.ins.due.localeCompare(b.ins.due) || a.bill.title.localeCompare(b.bill.title));
