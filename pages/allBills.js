/* "All Bills" tab: every bill, unpaid first */
import { $ } from '../assets/js/utils/dom.js';
import { state } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

/** Returns the tab's count; draws the panel only when `draw` (its tab is open). */
export function renderAllBills(draw = true) {
  if (draw) renderBillGrid($('#billGrid'), state.bills, 'No bills yet. Tap + to add one.');
  return state.bills.length;
}
