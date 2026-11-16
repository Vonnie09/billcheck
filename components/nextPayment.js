/* Top of the page: the next 3 unpaid payments ("Next payment", then two "Up next" cards).
   3 across on wide screens, stacked on phones. Shows fewer when fewer are due. */
import { daysUntil } from '../assets/js/utils/dates.js';
import { esc, fmtMoney, fmtLong, statusText, pillClass, methodName } from '../assets/js/utils/format.js';

const SHOW = 3;

function paymentCardHTML({ bill, ins, idx }, i) {
  const n = bill.installments.length;
  const d = daysUntil(ins.due);
  return `
    <div class="card next${i === 0 ? ' is-first' : ''}">
      <div class="next-main">
        <p class="next-label">${i === 0 ? 'Next payment' : 'Up next'}</p>
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
        <button class="btn btn-primary" type="button" data-action="pay" data-bill="${esc(bill.id)}" data-idx="${idx}">Mark as paid</button>
      </div>
    </div>`;
}

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
  const upcoming = queue.slice(0, SHOW);
  target.innerHTML = `<div class="next-set" data-count="${upcoming.length}">${upcoming.map(paymentCardHTML).join('')}</div>`;
}
