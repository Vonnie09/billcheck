/* "Done Bills" tab: fully paid bills */
import { $ } from '../assets/js/utils/dom.js';
import { state, isDone } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

/** Returns the tab's count; draws the panel only when `draw` (its tab is open). */
export function renderDoneBills(draw = true) {
  const bills = state.bills.filter(isDone);
  if (draw) renderBillGrid($('#doneGrid'), bills, 'No finished bills yet. Bills move here once every payment is made.');
  return bills.length;
}
