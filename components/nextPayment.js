/* "Next payment" card at the top: the earliest unpaid payment */
import { daysUntil } from '../assets/js/utils/dates.js';
import { esc, fmtMoney, fmtLong, statusText, pillClass, methodName } from '../assets/js/utils/format.js';

export function renderNextPayment(target, queue, hasBills) {
  if (!queue.length) {
    target.innerHTML = `
      <div class="card next">
        <div>
          <p class="next-label">Next payment</p>
          <h2 class="next-title">${hasBills ? "You're all paid up" : 'No bills yet'}</h2>
          <p class="next-meta">${hasBills ? 'Tap + to add a new bill.' : 'Tap + to add your first bill.'}</p>
        </div>
        ${hasBills ? '' : '<button class="btn btn-primary" type="button" data-action="add">Add a bill</button>'}
      </div>`;
    return;
  }
  const { bill, ins, idx } = queue[0];
  const n = bill.installments.length;
  const d = daysUntil(ins.due);
  target.innerHTML = `
    <div class="card next">
      <div>
        <p class="next-label">Next payment</p>
        <h2 class="next-title">${esc(bill.title)}${n > 1 ? ` <span class="next-label">· ${idx + 1} of ${n}</span>` : ''}</h2>
        <p class="next-amount">${fmtMoney(ins.amount)}</p>
        <p class="next-meta">via ${methodName(bill.method)}</p>
      </div>
      <div class="next-side">
        <div class="next-due${d < 0 ? ' is-overdue' : ''}">
          <span class="next-due-lbl">Due date</span>
          <span class="next-due-date">${fmtLong(ins.due)}</span>
          <span class="pill ${pillClass(d)}">${statusText(d)}</span>
        </div>
        <button class="btn btn-primary" type="button" data-action="pay" data-bill="${bill.id}" data-idx="${idx}">Mark as paid</button>
      </div>
    </div>`;
}
