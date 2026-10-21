/* One unpaid payment as a list row (used by Next Bill and the overdue list) */
import { daysUntil, parseISO } from '../assets/js/utils/dates.js';
import { esc, fmtMoney, statusText, pillClass, methodName } from '../assets/js/utils/format.js';

export function paymentRowHTML({ bill, ins, idx }) {
  const d = daysUntil(ins.due);
  const n = bill.installments.length;
  const dt = parseISO(ins.due);
  return `
    <li class="row">
      <div class="row-date"><b>${dt.getDate()}</b><span>${dt.toLocaleDateString('en-US', { month: 'short' })}</span></div>
      <div style="min-width:0">
        <div class="row-title">${esc(bill.title)}${n > 1 ? ` <span class="row-sub">${idx + 1}/${n}</span>` : ''}</div>
        <div class="row-sub">${methodName(bill.method)}</div>
      </div>
      <div class="row-right">
        <div class="row-amt">${fmtMoney(ins.amount)}</div>
        <span class="pill ${pillClass(d)}">${statusText(d)}</span>
      </div>
      <button class="btn btn-secondary btn-sm" type="button" data-action="pay" data-bill="${bill.id}" data-idx="${idx}">Pay</button>
    </li>`;
}
