/* Glass popup about the maker, opened by tapping the name in the footer's "made by" badge */
import { CREDIT } from '../config/settings.js';
import { $, closeOnBackdrop } from '../assets/js/utils/dom.js';
import { esc } from '../assets/js/utils/format.js';

let dialog;

export function mountCreditDialog() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="creditDialog" class="modal credit-modal" aria-labelledby="creditName">
      <form method="dialog">
        <button class="icon-btn credit-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </form>
      <div class="credit-avatar" aria-hidden="true">${esc(CREDIT.initials)}</div>
      <p class="credit-eyebrow">Designed &amp; built by</p>
      <h2 id="creditName" translate="no">${esc(CREDIT.name)}</h2>
      <p class="credit-desc">Creator of <span translate="no">BillCheck</span>, a simple bill and installment tracker.</p>
      <a class="btn btn-primary credit-link" href="${esc(CREDIT.portfolio)}" target="_blank" rel="noopener">
        View Von's Portfolio
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>
      </a>
      <p class="credit-url">${esc(CREDIT.portfolio.replace(/^https:\/\/|\/$/g, ''))}</p>
    </dialog>`);
  dialog = $('#creditDialog');
  closeOnBackdrop(dialog);
}

export function openCreditDialog() {
  dialog.showModal();
}
