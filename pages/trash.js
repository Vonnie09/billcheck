/* Trash tab: deleted bills, with Restore and Delete forever */
import { $ } from '../assets/js/utils/dom.js';
import { state } from '../assets/js/state.js';
import { esc, fmtMoney, plural } from '../assets/js/utils/format.js';

function trashRowHTML(b) {
  const n = b.installments.length;
  const paidN = b.installments.filter(i => i.paid).length;
  const deleted = b.deletedAt ? new Date(b.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  return `
    <li class="row trash-row">
      <div style="min-width:0">
        <div class="row-title">${esc(b.title)}</div>
        <div class="row-sub">${n > 1 ? `${paidN} of ${n} paid · ` : ''}${deleted ? `Deleted ${deleted}` : 'Deleted'}</div>
      </div>
      <div class="row-amt">${fmtMoney(b.total)}</div>
      <div class="trash-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="restore" data-trash="${b.id}">Restore</button>
        <button class="btn btn-text-danger btn-sm" type="button" data-action="delete-forever" data-trash="${b.id}" aria-label="Delete ${esc(b.title)} forever">Delete forever</button>
      </div>
    </li>`;
}

export function renderTrash() {
  const target = $('#trashList');
  if (!state.trash.length) {
    target.innerHTML = `<div class="empty">Trash is empty.<br>Deleted bills show up here so you can restore them.</div>`;
    return 0;
  }
  const items = [...state.trash].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  target.innerHTML = `
    <div class="trash-head">
      <span>${plural(items.length, 'deleted bill')}</span>
      <button class="btn btn-text-danger btn-sm" type="button" data-action="empty-trash">Empty trash</button>
    </div>
    <ol class="list card">${items.map(trashRowHTML).join('')}</ol>`;
  return items.length;
}
