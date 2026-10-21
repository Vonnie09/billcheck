/* "All Bills" tab: every bill, unpaid first */
import { $ } from '../assets/js/utils/dom.js';
import { state } from '../assets/js/state.js';
import { renderBillGrid } from '../components/billGrid.js';

export function renderAllBills() {
  renderBillGrid($('#billGrid'), state.bills, 'No bills yet. Tap + to add one.');
  return state.bills.length;
}
