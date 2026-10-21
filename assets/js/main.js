/* BillCheck: app entry point.
   Builds the page, loads the data, and routes every button click (data-action) to its handler. */
import { $ } from './utils/dom.js';
import { toISO, today } from './utils/dates.js';
import { methodName } from './utils/format.js';
import { state, load, save, savedMode, findBill, findTrashed } from './state.js';
import { render, setTab, savedTab } from './render.js';
import { initTheme, toggleTheme } from './theme.js';
import { askPay, askUnpay, moveToTrash, restore, askDeleteForever, askEmptyTrash, askReset, switchMode } from './actions.js';
import { mountHeader } from '../../components/header.js';
import { mountBillForm, openBillForm } from '../../components/billForm.js';
import { mountConfirmDialog } from '../../components/confirmDialog.js';
import { mountOverdueDialog, openOverdueDialog } from '../../components/overdueDialog.js';
import { mountImageViewer, viewImage } from '../../components/imageViewer.js';

/* 1. Build the page pieces */
mountHeader($('#header'));
mountBillForm();
mountConfirmDialog();
mountOverdueDialog();
mountImageViewer();
initTheme();

/* 2. Load the last-used mode's bills and draw the screen */
state.mode = savedMode();
Object.assign(state, load());
save();
setTab(savedTab());
render();

/* 3. Button clicks: every clickable element has a data-action */
const handlers = {
  'add': () => openBillForm(),
  'tab': el => setTab(el.dataset.tab),
  'mode': el => switchMode(el.dataset.mode),
  'reset': () => askReset(),
  'toggle-theme': () => toggleTheme(),
  'view-overdue': () => openOverdueDialog(),
  'pay': (el, bill) => askPay(bill, Number(el.dataset.idx)),
  'unpay': (el, bill) => askUnpay(bill, Number(el.dataset.idx)),
  'delete': (el, bill) => moveToTrash(bill),
  'view-method': (el, bill) => viewImage(bill.methodImg, `${bill.title} · ${methodName(bill.method)}`),
  'view-receipt': (el, bill) => viewImage(bill.installments[Number(el.dataset.idx)].receipt, `${bill.title} · receipt`),
  'restore': (el, bill, trashed) => restore(trashed),
  'delete-forever': (el, bill, trashed) => askDeleteForever(trashed),
  'empty-trash': () => askEmptyTrash(),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  const handler = el && handlers[el.dataset.action];
  if (!handler) return;
  const bill = el.dataset.bill ? findBill(el.dataset.bill) : null;
  const trashed = el.dataset.trash ? findTrashed(el.dataset.trash) : null;
  if ((el.dataset.bill && !bill) || (el.dataset.trash && !trashed)) return;
  handler(el, bill, trashed);
});

/* 4. Refresh the dates if the app is reopened on a new day */
let lastDay = toISO(today());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && toISO(today()) !== lastDay) {
    lastDay = toISO(today());
    render();
  }
});
