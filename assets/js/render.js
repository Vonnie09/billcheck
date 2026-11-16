/* Redraws the screen from `state`, and switches tabs.
   Only the open tab is drawn (the others just update their count), so taps stay fast with many bills. */
import { $ } from './utils/dom.js';
import { state, unpaidQueue } from './state.js';
import { TABS, STORAGE_KEYS } from '../../config/settings.js';
import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { backupStatus } from './backupStatus.js';
import { renderNextPayment } from '../../components/nextPayment.js';
import { renderSummary } from '../../components/summary.js';
import { refreshOverdueDialog } from '../../components/overdueDialog.js';
import { renderAllBills } from '../../pages/allBills.js';
import { renderNextBill } from '../../pages/nextBill.js';
import { renderOngoingBills } from '../../pages/ongoingBills.js';
import { renderDoneBills } from '../../pages/doneBills.js';
import { renderTrash } from '../../pages/trash.js';

let openTab = 'all';
const setCount = (sel, n) => { $(sel).textContent = n; };

export function render() {
  const queue = unpaidQueue();
  renderHeader(state.mode);
  renderNextPayment($('#hero'), queue, state.bills.length > 0);
  renderSummary($('#summary'));

  // Each page returns the number for its tab badge, and draws its panel only when that tab is open
  setCount('#countAll', renderAllBills(openTab === 'all'));
  setCount('#countNext', renderNextBill(queue, openTab === 'next'));
  setCount('#countOngoing', renderOngoingBills(openTab === 'ongoing'));
  setCount('#countDone', renderDoneBills(openTab === 'done'));
  const trashCount = renderTrash(openTab === 'trash');
  setCount('#countTrash', trashCount);
  $('#countTrash').hidden = !trashCount;

  refreshOverdueDialog(queue);
  renderFooter(backupStatus());
}

export function setTab(tab) {
  openTab = tab;
  document.querySelectorAll('#tabs .tab').forEach(t => {
    const selected = t.dataset.tab === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1; // arrow keys move between tabs (see main.js)
  });
  TABS.forEach(t => { $(`#panel-${t}`).hidden = t !== tab; });
  $(`#tab-${tab}`).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  try { localStorage.setItem(STORAGE_KEYS.tab, tab); } catch (e) { /* ignore */ }
  render();
}

/** The tab the user had open last time. */
export function savedTab() {
  try {
    const t = localStorage.getItem(STORAGE_KEYS.tab);
    if (TABS.includes(t)) return t;
  } catch (e) { /* ignore */ }
  return 'all';
}
