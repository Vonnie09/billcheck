/* When was the last backup, and is one needed? (Read-only; used by the footer and reminders.) */
import { STORAGE_KEYS, BACKUP_REMINDER_DAYS } from '../../config/settings.js';
import { state, readMode } from './state.js';

const DAY = 86400000;

const getNumber = key => { try { return Number(localStorage.getItem(key)) || null; } catch (e) { return null; } };
export const setNow = key => { try { localStorage.setItem(key, String(Date.now())); } catch (e) { /* ignore */ } };

/** The user's own bills (Empty State), wherever they are right now. */
export const userBills = () => (state.mode === 'empty' ? state.bills : readMode('empty')?.bills) || [];

export function backupStatus() {
  const last = getNumber(STORAGE_KEYS.lastBackup);
  const days = last === null ? null : Math.floor((Date.now() - last) / DAY);
  const bills = userBills();
  const oldestBill = bills.length ? Math.min(...bills.map(b => b.createdAt || Date.now())) : null;
  const needsBackup = bills.length > 0 && (
    days === null ? Date.now() - oldestBill > 3 * DAY : days >= BACKUP_REMINDER_DAYS
  );
  const label = days === null ? 'No backup yet' : days === 0 ? 'Last backup: today' : days === 1 ? 'Last backup: yesterday' : `Last backup: ${days} days ago`;
  return { days, label, needsBackup, userBillCount: bills.length };
}

/** Remind at most once a week. */
export const reminderDue = () => {
  const last = getNumber(STORAGE_KEYS.backupReminder);
  return last === null || Date.now() - last >= 7 * DAY;
};
