/* One bill card, with a box for each installment */
import { FREQ } from '../config/settings.js';
import { daysUntil } from '../assets/js/utils/dates.js';
import { esc, fmtMoney, fmtDate, fmtLong, statusText, pillClass, methodName } from '../assets/js/utils/format.js';

const TRASH_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

/** One installment box (or one wide box for a one-time bill). */
function installmentHTML(bill, ins, i, n, nextIdx) {
  const d = daysUntil(ins.due);
  const cls = ins.paid ? 'is-paid' : d < 0 ? 'is-overdue' : i === nextIdx ? 'is-next' : '';
  const action = ins.paid ? 'unpay' : 'pay';
  const label = ins.paid
    ? `Payment ${i + 1} paid on ${fmtDate(ins.paidAt)}. Click to undo.`
    : `Payment ${i + 1} of ${n}, ${fmtMoney(ins.amount)}, due ${fmtLong(ins.due)}. Click to mark as paid.`;
  const attrs = `type="button" data-action="${action}" data-bill="${bill.id}" data-idx="${i}" title="${esc(label)}" aria-label="${esc(bill.title)}: ${esc(label)}"`;

  if (n === 1) {
    const right = ins.paid
      ? `<span class="pill is-paid">Paid ${fmtDate(ins.paidAt)} ✓</span>`
      : `<span class="pill ${pillClass(d)}">${statusText(d)}</span>`;
    return `<button class="part part--wide ${cls}" ${attrs}><span>Due ${fmtLong(ins.due)}</span>${right}</button>`;
  }
  return `<button class="part ${cls}" ${attrs}>
    <span class="part-n">${i + 1}/${n}${ins.paid ? ' ✓' : ''}</span>
    <span class="part-date">${fmtDate(ins.due)}</span>
  </button>`;
}

export function billCardHTML(b) {
  const n = b.installments.length;
  const paidN = b.installments.filter(i => i.paid).length;
  const done = paidN === n;
  const nextIdx = b.installments.findIndex(i => !i.paid);
  const left = b.installments.reduce((s, i) => s + (i.paid ? 0 : i.amount), 0);
  // Boxes per row: up to 6 on wide cards, fewer on narrow (phone) cards
  const cols = n <= 6 ? n : n <= 12 ? Math.ceil(n / 2) : 6;
  const colsNarrow = n <= 4 ? n : n <= 6 || n === 9 ? 3 : 4;
  const plan = n > 1 ? `${n} × ${fmtMoney(b.installments[n - 1].amount)} ${FREQ[b.freq] || FREQ.monthly}` : 'One-time payment';
  const thumb = b.methodImg
    ? `<button class="thumb" type="button" data-action="view-method" data-bill="${b.id}" aria-label="View payment method image"><img src="${b.methodImg}" alt=""></button>`
    : '';

  return `
    <article class="card bill${done ? ' is-done' : ''}" data-card="${b.id}">
      <div class="bill-head">
        <div>
          <h3 class="bill-title">${esc(b.title)}</h3>
          <p class="bill-amount">${fmtMoney(b.total)}</p>
        </div>
        <button class="icon-btn" type="button" data-action="delete" data-bill="${b.id}" aria-label="Move ${esc(b.title)} to trash" title="Move to trash">${TRASH_ICON}</button>
      </div>
      <p class="bill-plan">${plan}</p>
      <div class="bill-meta"><span>${methodName(b.method)}</span>${thumb}</div>
      <div class="parts" style="--cols:${cols};--cols-narrow:${colsNarrow}">
        ${b.installments.map((ins, i) => installmentHTML(b, ins, i, n, nextIdx)).join('')}
      </div>
      ${n > 1 ? `
        <div class="progress"><span style="width:${(paidN / n) * 100}%"></span></div>
        <div class="bill-foot"><span>${paidN} of ${n} paid</span><span>${done ? 'Fully paid' : `${fmtMoney(left)} left`}</span></div>` : ''}
    </article>`;
}
