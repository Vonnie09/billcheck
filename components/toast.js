/* Small message at the bottom of the screen, with an optional Undo button */
import { esc } from '../assets/js/utils/format.js';

let el;
let timer;

function getEl() {
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  return el;
}

const hide = () => getEl().classList.remove('is-on');

/** toast(msg) · toast(msg, { undo }) · toast(msg, { action: { label, fn }, duration }) */
export function toast(msg, { undo, action, duration } = {}) {
  const box = getEl();
  const button = undo ? { label: 'Undo', fn: undo } : action;
  box.innerHTML = `<span>${esc(msg)}</span>${button ? `<button type="button">${esc(button.label)}</button>` : ''}`;
  if (button) box.querySelector('button').onclick = () => { hide(); button.fn(); };
  box.classList.add('is-on');
  clearTimeout(timer);
  timer = setTimeout(hide, duration || (button ? 6000 : 4000));
}
