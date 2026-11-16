/* BillCheck: app entry point.
   Builds the page, loads the data, and routes every button click (data-action) to its handler. */
import { STORAGE_KEYS } from '../../config/settings.js';
import { $ } from './utils/dom.js';
import { toISO, today } from './utils/dates.js';
import { methodName } from './utils/format.js';
import { isIOS, isFirefox, isStandalone } from './utils/platform.js';
import { state, load, save, startMode, findBill, findTrashed } from './state.js';
import { render, setTab, savedTab } from './render.js';
import { initTheme, toggleTheme } from './theme.js';
import { initInstall, askInstall } from './install.js';
import { initBackup, exportBackup, chooseBackupFile, maybeRemindBackup } from './backup.js';
import { setNow } from './backupStatus.js';
import { askPay, askUnpay, moveToTrash, restore, askDeleteForever, askEmptyTrash, askReset, switchMode } from './actions.js';
import { mountHeader } from '../../components/header.js';
import { mountFooter } from '../../components/footer.js';
import { mountBillForm, openBillForm } from '../../components/billForm.js';
import { mountConfirmDialog } from '../../components/confirmDialog.js';
import { mountOverdueDialog, openOverdueDialog } from '../../components/overdueDialog.js';
import { mountImageViewer, viewImage } from '../../components/imageViewer.js';
import { mountCreditDialog, openCreditDialog } from '../../components/creditDialog.js';
import { toast } from '../../components/toast.js';

/* 1. Build the page pieces */
mountHeader($('#header'));
mountFooter($('#footer'));
mountBillForm();
mountConfirmDialog();
mountOverdueDialog();
mountImageViewer();
mountCreditDialog();
initTheme();
initInstall();
initBackup();

/* 2. Load the bills and draw the screen.
   Installed app: always your own bills, and the Demo / Empty toggle is hidden (see index.html). */
const installed = isStandalone();
document.documentElement.classList.toggle('is-installed', installed);
state.mode = startMode(installed);
Object.assign(state, load());
save();
setTab(savedTab()); // also draws the screen

/* 3. Keep the bills safe on this device */
// Ask the browser not to clear BillCheck's storage when the device runs low on space.
// (Skipped on Firefox, which shows a permission popup for this.)
if (!isFirefox) navigator.storage?.persist?.().catch(() => {});

// First time the iPhone home-screen app opens: it can't see bills saved in Safari
let welcomed = true;
try { welcomed = !!localStorage.getItem(STORAGE_KEYS.appWelcome); } catch (e) { /* ignore */ }
if (isIOS && isStandalone() && !welcomed) {
  setNow(STORAGE_KEYS.appWelcome);
  toast('Had bills in Safari? Export them there, then tap Import backup at the bottom of this page.', { duration: 9000 });
} else {
  maybeRemindBackup();
}

/* 4. Button clicks: every clickable element has a data-action */
const handlers = {
  'add': () => openBillForm(),
  'tab': el => setTab(el.dataset.tab),
  'install': () => askInstall(),
  'mode': el => switchMode(el.dataset.mode),
  'reset': () => askReset(),
  'toggle-theme': () => toggleTheme(),
  'credit': () => openCreditDialog(),
  'export-backup': () => exportBackup(),
  'import-backup': () => chooseBackupFile(),
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

// Keyboard: arrow keys move between the tabs, and between Demo Mode / Empty State
document.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const current = e.target.closest?.('[role="tab"], [role="radio"]');
  if (!current) return;
  const items = [...current.parentElement.querySelectorAll('[role="tab"], [role="radio"]')];
  const next = items[(items.indexOf(current) + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
  e.preventDefault();
  next.click();
  next.focus();
});

/* 5. Coming back to the app */
// Phones (iPhone especially) keep the installed app paused in the background for days.
// After 30+ minutes away, reload to pick up the newest version — unless a popup is open.
const RELOAD_AFTER_MS = 30 * 60 * 1000;
let hiddenAt = null;
let lastDay = toISO(today());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); return; }
  const away = hiddenAt ? Date.now() - hiddenAt : 0;
  if (away >= RELOAD_AFTER_MS && navigator.onLine && !document.querySelector('dialog[open]')) {
    location.reload();
    return;
  }
  if (toISO(today()) !== lastDay) {
    lastDay = toISO(today());
    render();
  }
});
