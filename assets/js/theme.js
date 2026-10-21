/* Dark mode. Dark is the default; the moon/sun button switches and the choice is remembered. */
import { STORAGE_KEYS } from '../../config/settings.js';
import { $ } from './utils/dom.js';

const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;

function syncThemeButton() {
  const dark = isDark();
  root.classList.toggle('is-dark', dark);
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  const btn = $('#themeBtn');
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

export function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem(STORAGE_KEYS.theme, next); } catch (e) { /* ignore */ }
  syncThemeButton();
}

export function initTheme() {
  systemDark.addEventListener('change', syncThemeButton);
  syncThemeButton();
}
