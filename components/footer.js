/* Footer: where your bills are stored, last backup, and Export / Import backup buttons */
import { $ } from '../assets/js/utils/dom.js';
import { isIOS } from '../assets/js/utils/platform.js';

export function mountFooter(target) {
  target.innerHTML = `
    <div class="card backup-card">
      <div class="backup-text">
        <p class="backup-title">Your bills are saved on this device only</p>
        <p class="backup-sub" id="backupStatus"></p>
        ${isIOS ? '<p class="backup-sub">On iPhone, Safari and the home-screen app keep separate bills. Export here, then Import there, to move them.</p>' : ''}
      </div>
      <div class="backup-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-backup">Export backup</button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="import-backup">Import backup</button>
        <input type="file" id="importFile" accept=".json,application/json" hidden>
      </div>
    </div>
    <p class="footer-note">BillCheck · no account needed · your data never leaves your device</p>`;
}

/** status = backupStatus() from assets/js/backupStatus.js */
export function renderFooter(status) {
  const el = $('#backupStatus');
  el.textContent = status.needsBackup ? `${status.label}. Back up to keep your bills safe.` : status.label;
  el.classList.toggle('is-warn', status.needsBackup);
}
