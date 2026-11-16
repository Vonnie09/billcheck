/* Tests for the logic where a mistake costs the most: money splits, dates, amounts typed by the
   user, and checking imported bills. Run from the project folder with:  node --test
   (Node's built-in test runner — nothing to install.) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSchedule } from '../assets/js/utils/schedule.js';
import { formatMoneyInput, parseMoney } from '../assets/js/utils/moneyInput.js';
import { statusText } from '../assets/js/utils/format.js';
import { cleanBill, cleanBills } from '../assets/js/utils/cleanBill.js';
import { seed } from '../config/demoData.js';

test('installments add up to the total, to the cent', () => {
  for (const [total, count] of [[1000, 3], [42000, 6], [0.05, 2], [12345678.9, 48], [549, 7]]) {
    const parts = buildSchedule(total, '2026-01-15', count, 'monthly');
    const sum = Math.round(parts.reduce((s, p) => s + p.amount * 100, 0));
    assert.equal(sum, Math.round(total * 100), `${total} in ${count} payments`);
    assert.equal(parts.length, count);
  }
  assert.deepEqual(buildSchedule(1000, '2026-01-15', 3, 'monthly').map(p => p.amount), [333.34, 333.33, 333.33]);
});

test('monthly due dates handle short months (Jan 31 → Feb 28 → Mar 31)', () => {
  assert.deepEqual(buildSchedule(300, '2026-01-31', 3, 'monthly').map(p => p.due), ['2026-01-31', '2026-02-28', '2026-03-31']);
  assert.deepEqual(buildSchedule(200, '2026-12-15', 2, 'weekly').map(p => p.due), ['2026-12-15', '2026-12-22']);
  assert.deepEqual(buildSchedule(200, '2026-12-25', 2, 'biweekly').map(p => p.due), ['2026-12-25', '2027-01-08']);
});

test('amount box adds commas and reads them back', () => {
  assert.equal(formatMoneyInput('1250000.567'), '1,250,000.56');
  assert.equal(formatMoneyInput('₱5,000'), '5,000');
  assert.equal(formatMoneyInput('000750'), '750');
  assert.equal(formatMoneyInput('1.2.3'), '1.23');
  assert.equal(parseMoney('1,250,000.56'), 1250000.56);
  assert.ok(Number.isNaN(parseMoney('')));
});

test('due status reads naturally', () => {
  assert.equal(statusText(-1), '1 day late');
  assert.equal(statusText(0), 'Due today');
  assert.equal(statusText(1), 'Due tomorrow');
  assert.equal(statusText(45), 'In 45 days');
  assert.equal(statusText(90), 'In 3 months');
  assert.equal(statusText(-400), '1 year late');
  assert.equal(statusText(823), 'In 2 years');
});

const good = { id: 'b1', title: 'Rent', total: 100, freq: 'monthly', method: 'bank', methodImg: 'data:image/jpeg;base64,/9j/4AAQ+abc=', createdAt: 1, installments: [{ due: '2026-12-01', amount: 100, paid: false, paidAt: null, receipt: null }] };

test('a normal bill passes through unchanged', () => {
  assert.deepEqual(cleanBill(good), good);
});

test('demo bills (with their QR images) all pass the check', () => {
  const demo = seed();
  const cleaned = cleanBills(demo);
  assert.equal(cleaned.length, demo.length);
  assert.ok(cleaned.filter(b => b.methodImg).length >= 3);
});

test('code hidden in a backup file is removed', () => {
  const evil = cleanBill({ ...good, id: 'x" onmouseover="alert(1)', methodImg: 'x" onerror="alert(1)',
    installments: [{ ...good.installments[0], receipt: 'javascript:alert(1)' }] });
  assert.match(evil.id, /^[\w-]+$/);
  assert.equal(evil.methodImg, null);
  assert.equal(evil.installments[0].receipt, null);
});

test('damaged bills are skipped instead of crashing the app', () => {
  assert.equal(cleanBill({ ...good, installments: [{ due: 20261201, amount: 50 }] }), null);
  assert.equal(cleanBill({ ...good, installments: [] }), null);
  assert.equal(cleanBill(null), null);
  assert.equal(cleanBills([good, { title: 'broken' }, 'nonsense']).length, 1);
});

test('odd values are repaired', () => {
  const fixed = cleanBill({ ...good, title: '  ' + 'x'.repeat(500), method: 'bitcoin', freq: 'daily', total: 'lots' });
  assert.equal(fixed.title.length, 120);
  assert.equal(fixed.method, 'cash');
  assert.equal(fixed.freq, 'monthly');
  assert.equal(fixed.total, 100); // falls back to the sum of the payments
  const twins = cleanBills([good, good]);
  assert.notEqual(twins[0].id, twins[1].id);
});
