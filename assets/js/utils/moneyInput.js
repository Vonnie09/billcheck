/* Money inputs: adds commas while typing (12500.5 → 12,500.5) and reads the number back. */

/** Keep only digits and one dot, max 2 decimals, no leading zeros. */
function clean(text) {
  let v = String(text).replace(/[^\d.]/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return v.replace(/^0+(?=\d)/, '');
}

/** "1250000.5" → "1,250,000.5" */
export function formatMoneyInput(text) {
  const [int, dec] = clean(text).split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === undefined ? withCommas : `${withCommas}.${dec}`;
}

/** "1,250,000.50" → 1250000.5 (NaN if empty) */
export const parseMoney = text => parseFloat(String(text).replace(/,/g, ''));

/** Format an <input> as the user types, keeping the cursor in the right place. */
export function attachMoneyInput(input) {
  input.addEventListener('input', () => {
    const before = input.value;
    const caret = input.selectionStart ?? before.length;
    // How many digits/dots were before the cursor; commas don't count
    const kept = clean(before.slice(0, caret)).length;
    const after = formatMoneyInput(before);
    if (after === before) return;
    input.value = after;
    let pos = 0;
    for (let seen = 0; pos < after.length && seen < kept; pos++) {
      if (after[pos] !== ',') seen++;
    }
    if (document.activeElement === input) input.setSelectionRange(pos, pos);
  });
}
