/* Image upload box (click or drag & drop), used for the payment method image and receipts */
import { $ } from '../assets/js/utils/dom.js';
import { readImage } from '../assets/js/utils/image.js';
import { toast } from './toast.js';

export const uploadFieldHTML = ({ id, emptyText, alt }) => `
  <div class="upload" id="${id}">
    <input type="file" accept="image/*" id="${id}File" class="sr-only">
    <label for="${id}File" class="upload-empty">${emptyText}</label>
    <div class="upload-filled" hidden>
      <img alt="${alt}">
      <button type="button" class="link-btn upload-remove">Remove</button>
    </div>
  </div>`;

/** Wire up an upload box. Returns { value, set(dataUrl|null) }. */
export function makeUpload(root) {
  const input = $('input[type=file]', root);
  const empty = $('.upload-empty', root);
  const filled = $('.upload-filled', root);
  const img = $('img', filled);
  let value = null;

  const set = v => {
    value = v;
    empty.hidden = !!v;
    filled.hidden = !v;
    if (v) img.src = v; else img.removeAttribute('src');
    input.value = '';
  };
  const handle = async file => {
    if (!file) return;
    try { set(await readImage(file)); }
    catch (e) { toast('Please choose an image file (PNG or JPG).'); }
  };

  input.addEventListener('change', () => handle(input.files[0]));
  root.addEventListener('dragover', e => { e.preventDefault(); root.classList.add('is-drag'); });
  root.addEventListener('dragleave', () => root.classList.remove('is-drag'));
  root.addEventListener('drop', e => { e.preventDefault(); root.classList.remove('is-drag'); handle(e.dataTransfer.files[0]); });
  $('.upload-remove', root).addEventListener('click', () => set(null));
  return { get value() { return value; }, set };
}
