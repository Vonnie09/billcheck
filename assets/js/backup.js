/* Export / Import backup: saves all bills (both modes, with images) to a file you can keep
   anywhere, and restores them on any phone or computer. Protects against cleared data,
   uninstalling, switching phones, and iPhone's separate Safari / home-screen storage. */
import { STORAGE_KEYS, MODES } from '../../config/settings.js';
import { state, save, load, readMode, writeMode, setMode } from './state.js';
import { render } from './render.js';
import { backupStatus, reminderDue, setNow } from './backupStatus.js';
import { $ } from './utils/dom.js';
import { toISO, today } from './utils/dates.js';
import { plural } from './utils/format.js';
import { isTouch } from './utils/platform.js';
import { openConfirm } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';

const isValidMode = m => m && Array.isArray(m.bills) &&
  m.bills.every(b => b && typeof b.title === 'string' && Array.isArray(b.installments));

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportBackup() {
  save();
  const data = {};
  for (const m of MODES) data[m] = readMode(m) || { bills: [], trash: [] };
  const payload = { app: 'BillCheck', kind: 'backup', version: 1, exportedAt: new Date().toISOString(), data };
  const name = `billcheck-backup-${toISO(today())}.json`;
  const file = new File([JSON.stringify(payload)], name, { type: 'application/json' });

  try {
    // Phones: open the share sheet (Save to Files, Google Drive, email, …)
    if (isTouch && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'BillCheck backup' });
    } else {
      downloadFile(file);
    }
  } catch (e) {
    if (e.name === 'AbortError') return; // closed the share sheet; nothing saved
    downloadFile(file);
  }
  setNow(STORAGE_KEYS.lastBackup);
  render();
  toast(`Backup saved (${name})`);
}

/** Open the file picker; the restore continues in onFileChosen. */
export function chooseBackupFile() {
  $('#importFile').click();
}

async function onFileChosen(e) {
  const input = e.target;
  const file = input.files[0];
  input.value = ''; // allow picking the same file again later
  if (!file) return;

  let backup;
  try {
    backup = JSON.parse(await file.text());
    if (backup?.app !== 'BillCheck' || !backup.data || !MODES.some(m => isValidMode(backup.data[m]))) throw new Error('not a backup');
  } catch (err) {
    toast("That file isn't a BillCheck backup.");
    return;
  }

  const userCount = isValidMode(backup.data.empty) ? backup.data.empty.bills.length : 0;
  const demoCount = isValidMode(backup.data.demo) ? backup.data.demo.bills.length : 0;
  const when = backup.exportedAt
    ? new Date(backup.exportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'an unknown date';

  openConfirm({
    title: 'Restore this backup?',
    body: `<dl class="details">
        <div><dt>Backup from</dt><dd>${when}</dd></div>
        <div><dt>Your bills</dt><dd>${plural(userCount, 'bill')}</dd></div>
        <div><dt>Demo bills</dt><dd>${plural(demoCount, 'bill')}</dd></div>
      </dl>
      <p class="confirm-text">This replaces the bills currently on this device.</p>`,
    ok: 'Restore',
    danger: true,
    onOk: () => {
      try {
        for (const m of MODES) if (isValidMode(backup.data[m])) writeMode(m, backup.data[m]);
      } catch (err) {
        toast('Not enough storage on this device to restore that backup.');
        return;
      }
      // Show the user's own bills if the backup has any
      if (userCount > 0) setMode('empty');
      else Object.assign(state, load(state.mode));
      setNow(STORAGE_KEYS.lastBackup); // the device now matches a backup
      render();
      toast(`Backup restored: ${plural(userCount, 'bill')}`);
    },
  });
}

export function initBackup() {
  $('#importFile').addEventListener('change', onFileChosen);
}

/** Gentle nudge (max once a week) when the user's own bills haven't been backed up. */
export function maybeRemindBackup() {
  if (!backupStatus().needsBackup || !reminderDue()) return;
  setNow(STORAGE_KEYS.backupReminder);
  toast('Back up your bills so you never lose them', { action: { label: 'Export', fn: exportBackup }, duration: 8000 });
}
