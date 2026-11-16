/* "New bill" popup opened by the + button */
import { METHODS, FREQ, MIN_PAYMENTS, MAX_PAYMENTS, CURRENCY } from '../config/settings.js';
import { $, closeOnBackdrop } from '../assets/js/utils/dom.js';
import { toISO, today, addDays } from '../assets/js/utils/dates.js';
import { clamp, uid, fmtMoney, fmtDate } from '../assets/js/utils/format.js';
import { buildSchedule } from '../assets/js/utils/schedule.js';
import { attachMoneyInput, parseMoney } from '../assets/js/utils/moneyInput.js';
import { state, save } from '../assets/js/state.js';
import { setTab } from '../assets/js/render.js';
import { uploadFieldHTML, makeUpload } from './uploadField.js';
import { toast } from './toast.js';

const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

let dialog;
let form;
let methodUpload;

export function mountBillForm() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="billDialog" class="modal" aria-labelledby="billDialogTitle">
      <form id="billForm" novalidate>
        <div class="modal-head">
          <h2 id="billDialogTitle">New bill</h2>
          <button type="button" class="icon-btn" data-close aria-label="Close">${CLOSE_ICON}</button>
        </div>

        <div class="field">
          <label for="billTitle">Title</label>
          <input id="billTitle" name="billTitle" type="text" maxlength="60" placeholder="Electricity, rent, laptop…" required autocomplete="off" aria-describedby="billTitleError">
          <p class="field-error" id="billTitleError" hidden>Enter a name for this bill.</p>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="amount">Amount (${CURRENCY})</label>
            <input id="amount" name="amount" type="text" inputmode="decimal" autocomplete="off" placeholder="1,500.00" required aria-describedby="amountError">
            <p class="field-error" id="amountError" hidden>Enter an amount above ${CURRENCY}0.</p>
          </div>
          <div class="field">
            <label for="due" id="dueLabel">Due date</label>
            <input id="due" name="due" type="date" required aria-describedby="dueError">
            <p class="field-error" id="dueError" hidden>Pick a due date.</p>
          </div>
        </div>

        <label class="check">
          <input type="checkbox" name="isInstallment" id="isInstallment">
          <span>Pay in installments</span>
        </label>

        <div id="instFields" hidden>
          <div class="field-row">
            <div class="field">
              <label for="count">Number of payments</label>
              <input id="count" name="count" type="number" min="${MIN_PAYMENTS}" max="${MAX_PAYMENTS}" value="6" inputmode="numeric">
            </div>
            <div class="field">
              <label for="freq">Every</label>
              <select id="freq" name="freq">
                <option value="monthly">Month</option>
                <option value="biweekly">2 weeks</option>
                <option value="weekly">Week</option>
              </select>
            </div>
          </div>
          <p class="hint" id="instPreview" hidden></p>
        </div>

        <div class="field">
          <label for="method">Payment method</label>
          <select id="method" name="method">
            ${Object.entries(METHODS).map(([k, label]) => `<option value="${k}">${label}</option>`).join('')}
          </select>
        </div>

        <div class="field">
          <span class="label">Payment method image <span class="optional">(optional)</span></span>
          ${uploadFieldHTML({ id: 'methodDrop', emptyText: 'Upload a QR code, card, or account screenshot', alt: 'Uploaded payment method preview' })}
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Add bill</button>
        </div>
      </form>
    </dialog>`);

  dialog = $('#billDialog');
  form = $('#billForm');
  methodUpload = makeUpload($('#methodDrop'));
  attachMoneyInput(form.elements.amount);

  dialog.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
  closeOnBackdrop(dialog);
  form.addEventListener('input', e => { if (e.target.name) setError(e.target, false); updatePreview(); });
  form.addEventListener('change', updatePreview);
  form.addEventListener('submit', onSubmit);
}

export function openBillForm() {
  form.reset();
  [form.elements.billTitle, form.elements.amount, form.elements.due].forEach(x => setError(x, false));
  form.elements.due.value = toISO(addDays(today(), 7));
  methodUpload.set(null);
  updatePreview();
  dialog.showModal();
  setTimeout(() => form.elements.billTitle.focus(), 50);
}

/** Shows "6 payments of ₱3,000.00, monthly…" under the installment fields. */
function updatePreview() {
  const f = form.elements;
  const preview = $('#instPreview');
  const inst = f.isInstallment.checked;
  $('#instFields').hidden = !inst;
  $('#dueLabel').textContent = inst ? 'First due date' : 'Due date';
  const total = parseMoney(f.amount.value);
  if (!inst || !f.due.value || !(total > 0)) { preview.hidden = true; return; }
  const count = clamp(parseInt(f.count.value, 10) || MIN_PAYMENTS, MIN_PAYMENTS, MAX_PAYMENTS);
  const sched = buildSchedule(total, f.due.value, count, f.freq.value);
  const last = sched[sched.length - 1];
  preview.hidden = false;
  preview.textContent = `${count} payments of ${fmtMoney(last.amount)}, ${FREQ[f.freq.value]}. Last payment on ${fmtDate(last.due, { month: 'short', day: 'numeric', year: 'numeric' })}.`;
}

/** Show or hide a field's red outline and its message underneath (read out by screen readers). */
function setError(input, on) {
  const msg = $(`#${input.id}Error`);
  if (!msg) return;
  input.classList.toggle('is-invalid', on);
  input.setAttribute('aria-invalid', String(on));
  msg.hidden = !on;
}

function onSubmit(e) {
  e.preventDefault();
  const f = form.elements;
  const title = f.billTitle.value.trim();
  const total = Math.round(parseMoney(f.amount.value) * 100) / 100;
  const checks = [[f.billTitle, !title], [f.amount, !(total > 0)], [f.due, !f.due.value]];
  checks.forEach(([input, bad]) => setError(input, bad));
  const firstBad = checks.find(([, bad]) => bad);
  if (firstBad) {
    firstBad[0].focus();
    return;
  }
  const inst = f.isInstallment.checked;
  const count = inst ? clamp(parseInt(f.count.value, 10) || MIN_PAYMENTS, MIN_PAYMENTS, MAX_PAYMENTS) : 1;
  const freq = inst ? f.freq.value : 'monthly';
  const bill = {
    id: uid(), title, total, freq,
    method: f.method.value,
    methodImg: methodUpload.value,
    createdAt: Date.now(),
    installments: buildSchedule(total, f.due.value, count, freq),
  };
  state.bills.push(bill);
  if (!save()) { state.bills.pop(); return; }
  dialog.close();
  setTab('all'); // also redraws
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $(`#billGrid [data-card="${bill.id}"]`)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
  toast(`“${title}” added`);
}
