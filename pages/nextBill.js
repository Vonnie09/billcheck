/* "Next Bill" tab: every unpaid payment, grouped by when it's due */
import { $ } from '../assets/js/utils/dom.js';
import { daysUntil } from '../assets/js/utils/dates.js';
import { paymentRowHTML } from '../components/paymentRow.js';

// Day ranges (not calendar weeks/months), matching the summary's "Due in 30 days"
const GROUPS = [
  { title: 'Overdue', red: true, test: d => d < 0 },
  { title: 'Today', test: d => d === 0 },
  { title: 'Next 7 days', test: d => d > 0 && d <= 7 },
  { title: 'Next 30 days', test: d => d > 7 && d <= 30 },
  { title: 'Later', test: d => d > 30 },
];

/** Returns the tab's count; draws the panel only when `draw` (its tab is open). */
export function renderNextBill(queue, draw = true) {
  if (!draw) return queue.length;
  const target = $('#timeline');
  if (!queue.length) {
    target.innerHTML = `<div class="empty">Nothing due. Every bill is paid.</div>`;
    return 0;
  }
  target.innerHTML = GROUPS.map(g => {
    const items = queue.filter(x => g.test(daysUntil(x.ins.due)));
    if (!items.length) return '';
    return `
      <h3 class="group-title${g.red ? ' is-red' : ''}">${g.title}</h3>
      <ol class="list card">${items.map(paymentRowHTML).join('')}</ol>`;
  }).join('');
  return queue.length;
}
