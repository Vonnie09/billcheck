/* Summary box: Overdue / Due in 30 days / Left to pay */
import { state } from '../assets/js/state.js';
import { daysUntil } from '../assets/js/utils/dates.js';
import { fmtMoney } from '../assets/js/utils/format.js';

export function renderSummary(target) {
  let overdue = 0, overdueN = 0, next30 = 0, remaining = 0;
  for (const b of state.bills) for (const ins of b.installments) {
    if (ins.paid) continue;
    remaining += ins.amount;
    const d = daysUntil(ins.due);
    if (d < 0) { overdue += ins.amount; overdueN++; }
    else if (d <= 30) next30 += ins.amount;
  }
  const item = (lbl, val, red, extra = '') =>
    `<div${red ? ' class="is-alert"' : ''}><div class="summary-lbl">${lbl}</div><div class="summary-val${red ? ' is-red' : ''}">${fmtMoney(val)}</div>${extra}</div>`;
  const overdueExtra = overdueN
    ? `<button class="summary-link" type="button" data-action="view-overdue">View overdue ${overdueN === 1 ? 'bill' : `bills (${overdueN})`} →</button>`
    : `<p class="summary-note">Nothing overdue</p>`;
  target.innerHTML =
    item('Overdue', overdue, overdueN > 0, overdueExtra) +
    item('Due in 30 days', next30) +
    item('Left to pay', remaining);
}
