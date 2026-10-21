/* "Done Bills" tab: fully paid bills */
import { $ } from '../assets/js/utils/dom.js';
import { state, isDone } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

export function renderDoneBills() {
  const bills = state.bills.filter(isDone);
  renderBillGrid($('#doneGrid'), bills, 'No finished bills yet. Bills move here once every payment is made.');
  return bills.length;
}
