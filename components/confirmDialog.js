/* Confirmation popup (pay, unpay, delete forever, empty trash, reset) */
import { $, closeOnBackdrop } from '../assets/js/utils/dom.js';
import { esc, fmtMoney, fmtLong, methodName } from '../assets/js/utils/format.js';
import { uploadFieldHTML, makeUpload } from './uploadField.js';

let dialog;
let receiptUpload;
let ctx = null;

export function mountConfirmDialog() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="confirmDialog" class="modal modal--sm" aria-labelledby="confirmTitle">
      <form method="dialog">
        <h2 id="confirmTitle"></h2>
        <div id="confirmBody"></div>
        <div class="field" id="confirmUpload" hidden>
          <span class="label">Receipt <span class="optional">(optional)</span></span>
          ${uploadFieldHTML({ id: 'receiptDrop', emptyText: 'Attach proof of payment', alt: 'Receipt preview' })}
        </div>
        <div class="modal-actions">
          <button value="cancel" class="btn btn-secondary">Cancel</button>
          <button value="ok" class="btn btn-primary" id="confirmOk">OK</button>
        </div>
      </form>
    </dialog>`);

  dialog = $('#confirmDialog');
  receiptUpload = makeUpload($('#receiptDrop'));
  closeOnBackdrop(dialog);
  dialog.addEventListener('close', () => {
    const current = ctx;
    ctx = null;
    if (current && dialog.returnValue === 'ok') current.onOk(receiptUpload.value);
  });
}

/** Ask the user to confirm. onOk(receiptImage) runs only if they press the OK button. */
export function openConfirm({ title, body, ok, danger = false, upload = false, onOk = () => {} }) {
  ctx = { onOk };
  $('#confirmTitle').textContent = title;
  $('#confirmBody').innerHTML = body;
  $('#confirmUpload').hidden = !upload;
  receiptUpload.set(null);
  const okBtn = $('#confirmOk');
  okBtn.textContent = ok;
  okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
  dialog.returnValue = '';
  dialog.showModal();
  okBtn.focus();
}

/** The Bill / Payment / Due / Method / Amount summary shown in pay and unpay popups. */
export function paymentDetails(bill, idx, extra = '') {
  const ins = bill.installments[idx];
  const n = bill.installments.length;
  return `<dl class="details">
    <div><dt>Bill</dt><dd>${esc(bill.title)}</dd></div>
    ${n > 1 ? `<div><dt>Payment</dt><dd>${idx + 1} of ${n}</dd></div>` : ''}
    <div><dt>Due</dt><dd>${fmtLong(ins.due)}</dd></div>
    <div><dt>Method</dt><dd>${methodName(bill.method)}</dd></div>
    ${extra}
    <div class="total"><dt>Amount</dt><dd>${fmtMoney(ins.amount)}</dd></div>
  </dl>`;
}
