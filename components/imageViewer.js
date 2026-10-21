/* Full-size view of an uploaded payment method image or receipt */
import { $, closeOnBackdrop } from '../assets/js/utils/dom.js';

let dialog;

export function mountImageViewer() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="viewer" class="modal viewer" aria-label="Image preview">
      <img id="viewerImg" alt="">
      <p id="viewerCap" class="hint"></p>
      <form method="dialog"><button class="btn btn-secondary">Close</button></form>
    </dialog>`);
  dialog = $('#viewer');
  closeOnBackdrop(dialog);
}

export function viewImage(src, caption) {
  if (!src) return;
  $('#viewerImg').src = src;
  $('#viewerCap').textContent = caption;
  dialog.showModal();
}
