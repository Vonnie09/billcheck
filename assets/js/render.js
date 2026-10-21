/* Redraws the whole screen from `state`, and switches tabs. */
import { $ } from './utils/dom.js';
import { state, unpaidQueue } from './state.js';
import { TABS, STORAGE_KEYS } from '../../config/settings.js';
import { renderHeader } from '../../components/header.js';
import { renderNextPayment } from '../../components/nextPayment.js';
import { renderSummary } from '../../components/summary.js';
import { refreshOverdueDialog } from '../../components/overdueDialog.js';
import { renderAllBills } from '../../pages/allBills.js';
import { renderNextBill } from '../../pages/nextBill.js';
import { renderOngoingBills } from '../../pages/ongoingBills.js';
import { renderDoneBills } from '../../pages/doneBills.js';
import { renderTrash } from '../../pages/trash.js';

const setCount = (sel, n) => { $(sel).textContent = n; };

export function render() {
  const queue = unpaidQueue();
  renderHeader(state.mode);
  renderNextPayment($('#hero'), queue, state.bills.length > 0);
  renderSummary($('#summary'));

  // Each page draws its tab panel and returns the number for its tab badge
  setCount('#countAll', renderAllBills());
  setCount('#countNext', renderNextBill(queue));
  setCount('#countOngoing', renderOngoingBills());
  setCount('#countDone', renderDoneBills());
  const trashCount = renderTrash();
  setCount('#countTrash', trashCount);
  $('#countTrash').hidden = !trashCount;

  refreshOverdueDialog(queue);
}

export function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('#tabs .tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
  TABS.forEach(t => { $(`#panel-${t}`).hidden = t !== tab; });
  $(`#tab-${tab}`).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  try { localStorage.setItem(STORAGE_KEYS.tab, tab); } catch (e) { /* ignore */ }
}

/** The tab the user had open last time. */
export function savedTab() {
  try {
    const t = localStorage.getItem(STORAGE_KEYS.tab);
    if (TABS.includes(t)) return t;
  } catch (e) { /* ignore */ }
  return 'all';
}
