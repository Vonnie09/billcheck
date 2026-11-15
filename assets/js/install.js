/* "Add app to home screen": installs BillCheck as an app.
   Chrome, Edge and Android can install directly after the confirm popup.
   Safari (iPhone/iPad/Mac) and Firefox don't allow that, so the popup shows the steps instead. */
import { $ } from './utils/dom.js';
import { isIOS, isSafari, isAndroid, isStandalone as isInstalled } from './utils/platform.js';
import { userBills } from './backupStatus.js';
import { openConfirm } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';

let installPrompt = null; // the browser's install offer, saved until the button is pressed

const ICON = '<img src="assets/images/icons/icon-192.png" alt="" class="install-icon">';
const SHARE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px"><path d="M12 15V3m0 0L8 7m4-4l4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

/** Hide the button once the app is installed (or when opened as the app). */
function syncButton() {
  $('#installBtn').hidden = isInstalled();
}

export function initInstall() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* app still works without it */ });
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); // keep the browser's own banner away; our button opens it instead
    installPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    syncButton();
    toast('BillCheck was added to your home screen');
  });
  matchMedia('(display-mode: standalone)').addEventListener('change', syncButton);
  syncButton();
}

/** Steps for browsers that can't install from a button. */
function manualSteps() {
  if (isIOS) {
    // On iPhone the home-screen app gets its own, separate storage
    const tip = userBills().length
      ? `<p class="confirm-text"><b>Bring your bills along:</b> the app on your home screen starts empty on iPhone. Tap <b>Export backup</b> at the bottom of this page first, then <b>Import backup</b> in the app.</p>`
      : '';
    return `<ol class="install-steps">
      <li>Tap the <b>Share</b> button ${SHARE_ICON} in Safari's toolbar.</li>
      <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
      <li>Tap <b>Add</b> in the top-right corner.</li>
    </ol>${tip}`;
  }
  if (isSafari) {
    return `<ol class="install-steps">
      <li>In the menu bar, click <b>File</b>.</li>
      <li>Choose <b>Add to Dock</b>, then click <b>Add</b>.</li>
    </ol>`;
  }
  return `<ol class="install-steps">
    <li>Open your browser's menu (<b>⋮</b> or <b>☰</b>).</li>
    <li>Choose <b>${isAndroid ? 'Add to Home screen' : 'Install BillCheck'}</b> or <b>Install app</b>.</li>
  </ol>
  <p class="confirm-text">Don't see it? Open this page in Chrome or Edge, which support installing apps.</p>`;
}

export function askInstall() {
  if (isInstalled()) {
    toast('BillCheck is already installed');
    return;
  }
  if (installPrompt) {
    openConfirm({
      title: 'Add BillCheck to your home screen?',
      body: `<div class="install-card">${ICON}<p>Open BillCheck like a regular app, straight from your home screen, in its own window. It even works without internet.</p></div>`,
      ok: 'Add app',
      onOk: async () => {
        const prompt = installPrompt;
        installPrompt = null; // the browser only lets each offer be used once
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome !== 'accepted') toast('Not added. You can try again anytime.');
      },
    });
    return;
  }
  openConfirm({
    title: 'Add BillCheck to your home screen',
    body: `<div class="install-card">${ICON}<p>Your browser doesn't add apps with a button, but it only takes a few taps:</p></div>${manualSteps()}`,
    ok: 'Got it',
  });
}
