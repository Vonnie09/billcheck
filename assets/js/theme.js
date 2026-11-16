/* Dark mode. Dark is the default; the moon/sun button switches and the choice is remembered.
   (index.html sets data-theme before the page paints, so it's always "dark" or "light".) */
import { STORAGE_KEYS } from '../../config/settings.js';
import { $ } from './utils/dom.js';

const root = document.documentElement;
const BAR_COLOR = { dark: '#101422', light: '#EAF4F4' }; // phone status bar matches the page background
const isDark = () => root.dataset.theme !== 'light';

function syncTheme() {
  const dark = isDark();
  root.classList.toggle('is-dark', dark);
  $('meta[name="theme-color"]')?.setAttribute('content', dark ? BAR_COLOR.dark : BAR_COLOR.light);
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  const btn = $('#themeBtn');
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

export function toggleTheme() {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEYS.theme, root.dataset.theme); } catch (e) { /* ignore */ }
  syncTheme();
}

export const initTheme = syncTheme;
