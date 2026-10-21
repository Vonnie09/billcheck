/* Small DOM helpers */

/** Shorthand for querySelector. */
export const $ = (sel, root = document) => root.querySelector(sel);

/** Close a <dialog> when the dark backdrop around it is clicked. */
export const closeOnBackdrop = dialog =>
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
