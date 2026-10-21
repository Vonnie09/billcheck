/* "Overdue bills" popup, opened from the summary box */
import { $, closeOnBackdrop } from '../assets/js/utils/dom.js';
import { daysUntil } from '../assets/js/utils/dates.js';
import { fmtMoney } from '../assets/js/utils/format.js';
import { unpaidQueue } from '../assets/js/state.js';
import { paymentRowHTML } from './paymentRow.js';

let dialog;

export function mountOverdueDialog() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="overdueDialog" class="modal" aria-labelledby="overdueTitle">
      <div class="modal-head">
        <h2 id="overdueTitle">Overdue bills</h2>
        <form method="dialog">
          <button class="icon-btn" aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </form>
      </div>
      <div id="overdueList"></div>
    </dialog>`);
  dialog = $('#overdueDialog');
  closeOnBackdrop(dialog);
}

function renderList(queue) {
  const items = queue.filter(x => daysUntil(x.ins.due) < 0);
  if (!items.length) {
    $('#overdueList').innerHTML = `<p class="confirm-text" style="margin:14px 0 0">Nothing is overdue. Nice work!</p>`;
    return;
  }
  const total = items.reduce((s, x) => s + x.ins.amount, 0);
  $('#overdueList').innerHTML = `
    <ol class="list card">${items.map(paymentRowHTML).join('')}</ol>
    <div class="modal-total"><span>Total overdue</span><span>${fmtMoney(total)}</span></div>`;
}

export function openOverdueDialog() {
  renderList(unpaidQueue());
  dialog.showModal();
}

/** Keep the list current while it's open (e.g. after paying from inside it). */
export function refreshOverdueDialog(queue) {
  if (dialog?.open) renderList(queue);
}
