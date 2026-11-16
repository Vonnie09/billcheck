/* What happens when the user pays, unpays, deletes, restores or resets. */
import { state, save, isDone, setMode } from './state.js';
import { render } from './render.js';
import { toISO, today } from './utils/dates.js';
import { esc, fmtLong, plural } from './utils/format.js';
import { seed } from '../../config/demoData.js';
import { openConfirm, paymentDetails } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';

/* ---------- payments ---------- */
export function askPay(bill, idx) {
  const ins = bill.installments[idx];
  openConfirm({
    title: 'Confirm payment',
    body: paymentDetails(bill, idx),
    ok: 'Yes, I paid',
    upload: true,
    onOk: receipt => {
      ins.paid = true;
      ins.paidAt = toISO(today());
      ins.receipt = receipt || null;
      if (!save()) { ins.paid = false; ins.paidAt = null; ins.receipt = null; return; }
      render();
      toast(isDone(bill) ? `${bill.title} is fully paid` : 'Payment confirmed', {
        undo: () => { ins.paid = false; ins.paidAt = null; ins.receipt = null; save(); render(); },
      });
    },
  });
}

export function askUnpay(bill, idx) {
  const ins = bill.installments[idx];
  const receipt = ins.receipt
    ? `<div><dt>Receipt</dt><dd><button class="thumb" type="button" data-action="view-receipt" data-bill="${esc(bill.id)}" data-idx="${idx}" aria-label="View receipt"><img src="${esc(ins.receipt)}" alt="" width="28" height="28"></button></dd></div>`
    : '';
  openConfirm({
    title: 'Mark as unpaid?',
    body: `<p class="confirm-text">Paid on ${fmtLong(ins.paidAt || ins.due)}.</p>${paymentDetails(bill, idx, receipt)}`,
    ok: 'Mark unpaid',
    onOk: () => {
      const prev = { ...ins };
      ins.paid = false; ins.paidAt = null; ins.receipt = null;
      save(); render();
      toast('Marked as unpaid', { undo: () => { Object.assign(ins, prev); save(); render(); } });
    },
  });
}

/* ---------- trash ---------- */
export function moveToTrash(bill) {
  state.bills.splice(state.bills.indexOf(bill), 1);
  bill.deletedAt = Date.now();
  state.trash.push(bill);
  if (!save()) { restore(bill, true); return; }
  render();
  toast(`“${bill.title}” moved to Trash`, { undo: () => restore(bill, true) });
}

export function restore(bill, silent = false) {
  state.trash.splice(state.trash.indexOf(bill), 1);
  delete bill.deletedAt;
  state.bills.push(bill);
  save(); render();
  if (!silent) toast(`“${bill.title}” restored`);
}

export function askDeleteForever(bill) {
  openConfirm({
    title: `Delete “${bill.title}” forever?`,
    body: `<p class="confirm-text">This can't be undone.</p>`,
    ok: 'Delete forever',
    danger: true,
    onOk: () => {
      state.trash.splice(state.trash.indexOf(bill), 1);
      save(); render();
      toast('Deleted forever');
    },
  });
}

export function askEmptyTrash() {
  openConfirm({
    title: 'Empty the trash?',
    body: `<p class="confirm-text">${plural(state.trash.length, 'bill')} will be deleted forever. This can't be undone.</p>`,
    ok: 'Empty trash',
    danger: true,
    onOk: () => { state.trash = []; save(); render(); toast('Trash emptied'); },
  });
}

/* ---------- Demo Mode / Empty State ---------- */
export function switchMode(mode) {
  if (mode === state.mode) return;
  setMode(mode);
  save();
  render();
  toast(mode === 'demo' ? 'Demo Mode: showing sample bills' : 'Empty State: add your own bills');
}

/* ---------- demo ---------- */
export function askReset() {
  openConfirm({
    title: 'Reset the demo?',
    body: '<p class="confirm-text">Your bills will be replaced with the sample data, and the trash will be emptied.</p>',
    ok: 'Reset',
    danger: true,
    onOk: () => { state.bills = seed(); state.trash = []; save(); render(); toast('Demo data restored'); },
  });
}
