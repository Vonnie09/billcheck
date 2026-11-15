/* App-wide settings. Change the currency, payment methods, etc. here. */

// Keys used to save data in the browser (localStorage).
// They keep the app's original name (PayBills) on purpose: renaming them would erase visitors' saved bills.
// Note: index.html also reads 'paybills.theme' directly, so dark mode applies before the page paints.
export const STORAGE_KEYS = {
  data: 'paybills.v1',            // Demo Mode bills
  emptyData: 'paybills.empty.v1', // Empty State bills (saved separately from the demo)
  mode: 'paybills.mode',
  tab: 'paybills.tab',
  theme: 'paybills.theme',
  lastBackup: 'paybills.lastBackup',         // when the user last exported a backup
  backupReminder: 'paybills.backupReminder', // when we last reminded them
  appWelcome: 'paybills.appWelcome',         // shown the "import your Safari bills" tip in the iPhone app
};

// Remind the user to back up if their own bills haven't been backed up in this many days
export const BACKUP_REMINDER_DAYS = 14;

// "demo" = starts with sample bills, "empty" = starts with no bills
export const MODES = ['demo', 'empty'];

export const CURRENCY = '₱';
export const LOCALE = 'en-PH';

// Payment methods shown in the "Payment method" dropdown
export const METHODS = {
  ewallet: 'E-wallet',
  bank: 'Bank transfer',
  card: 'Card',
  cash: 'Cash',
  autodebit: 'Auto-debit',
};

// Installment frequencies
export const FREQ = {
  monthly: 'monthly',
  biweekly: 'every 2 weeks',
  weekly: 'weekly',
};

// Tabs, in order (each one has a file in /pages)
export const TABS = ['all', 'next', 'ongoing', 'done', 'trash'];

export const MIN_PAYMENTS = 2;
export const MAX_PAYMENTS = 48;
