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

export function toast(msg, { undo } = {}) {
  const box = getEl();
  box.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`;
  if (undo) box.querySelector('button').onclick = () => { undo(); hide(); };
  box.classList.add('is-on');
  clearTimeout(timer);
  timer = setTimeout(hide, 4000);
}
