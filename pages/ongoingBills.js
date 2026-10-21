/* "Ongoing Bills" tab: bills that still have payments left */
import { $ } from '../assets/js/utils/dom.js';
import { state, isDone } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

export function renderOngoingBills() {
  const bills = state.bills.filter(b => !isDone(b));
  renderBillGrid($('#ongoingGrid'), bills, 'No ongoing bills. Everything is paid.');
  return bills.length;
}
