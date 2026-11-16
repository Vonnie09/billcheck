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
import { cleanBills } from './utils/cleanBill.js';
import { openConfirm } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';

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

  // Every bill goes through cleanBills, so a damaged or crafted file can't crash the app or run code
  const restored = {};
  let skipped = 0;
  let when;
  try {
    const backup = JSON.parse(await file.text());
    if (backup?.app !== 'BillCheck' || !backup.data || typeof backup.data !== 'object') throw new Error('not a backup');
    for (const m of MODES) {
      const d = backup.data[m];
      if (!d || !Array.isArray(d.bills)) continue;
      restored[m] = { bills: cleanBills(d.bills), trash: cleanBills(d.trash) };
      skipped += d.bills.length - restored[m].bills.length;
    }
    if (!Object.keys(restored).length) throw new Error('no bills');
    when = Date.parse(backup.exportedAt)
      ? new Date(backup.exportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'an unknown date';
  } catch (err) {
    toast("That file isn't a BillCheck backup. Choose a file named billcheck-backup-….json.", { duration: 6000 });
    return;
  }

  const userCount = restored.empty?.bills.length || 0;
  const demoCount = restored.demo?.bills.length || 0;

  openConfirm({
    title: 'Restore this backup?',
    body: `<dl class="details">
        <div><dt>Backup from</dt><dd>${when}</dd></div>
        <div><dt>Your bills</dt><dd>${plural(userCount, 'bill')}</dd></div>
        <div><dt>Demo bills</dt><dd>${plural(demoCount, 'bill')}</dd></div>
      </dl>
      ${skipped ? `<p class="confirm-text">${plural(skipped, 'damaged bill')} couldn't be read and will be skipped.</p>` : ''}
      <p class="confirm-text">This replaces the bills currently on this device.</p>`,
    ok: 'Restore',
    danger: true,
    onOk: () => {
      try {
        for (const m of Object.keys(restored)) writeMode(m, restored[m]);
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
