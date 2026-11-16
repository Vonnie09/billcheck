/* "Ongoing Bills" tab: bills that still have payments left */
import { $ } from '../assets/js/utils/dom.js';
import { state, isDone } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

/** Returns the tab's count; draws the panel only when `draw` (its tab is open). */
export function renderOngoingBills(draw = true) {
  const bills = state.bills.filter(b => !isDone(b));
  if (draw) renderBillGrid($('#ongoingGrid'), bills, 'No ongoing bills. Everything is paid.');
  return bills.length;
}
