/* Header: app name, today's date, Demo Mode / Empty State toggle, "Reset demo" and the dark mode button */
import { $ } from '../assets/js/utils/dom.js';
import { today } from '../assets/js/utils/dates.js';

export function mountHeader(target) {
  target.innerHTML = `
    <div>
      <h1>BillCheck</h1>
      <p class="today" id="today"></p>
    </div>
    <div class="top-actions">
      <div class="mode-toggle" id="modeToggle" role="radiogroup" aria-label="Bills to show" data-mode="demo">
        <span class="mode-ink" aria-hidden="true"></span>
        <button type="button" role="radio" data-action="mode" data-mode="demo" aria-checked="true">Demo Mode</button>
        <button type="button" role="radio" data-action="mode" data-mode="empty" aria-checked="false">Empty State</button>
      </div>
      <button class="link-btn" id="resetBtn" type="button" data-action="reset">Reset demo</button>
      <button class="theme-btn" id="themeBtn" type="button" data-action="toggle-theme" aria-label="Switch to light mode" title="Switch to light mode">
        <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
    </div>`;
}

/** Update the date, the toggle position, and show "Reset demo" only in Demo Mode. */
export function renderHeader(mode) {
  $('#today').textContent = today().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const toggle = $('#modeToggle');
  toggle.dataset.mode = mode;
  toggle.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  $('#resetBtn').hidden = mode !== 'demo';
}
