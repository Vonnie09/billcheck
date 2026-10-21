/* Grid of bill cards. Sort: unpaid first, then by next due date, then A–Z. */
import { isDone, nextDue } from '../assets/js/state.js';
import { billCardHTML } from './billCard.js';

export function renderBillGrid(target, bills, emptyMsg) {
  if (!bills.length) {
    target.innerHTML = `<div class="empty">${emptyMsg}</div>`;
    return;
  }
  const sorted = [...bills].sort((a, b) =>
    (isDone(a) - isDone(b)) || nextDue(a).localeCompare(nextDue(b)) || a.title.localeCompare(b.title));
  target.innerHTML = sorted.map(billCardHTML).join('');
}
