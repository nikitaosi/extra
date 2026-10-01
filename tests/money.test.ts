import assert from 'node:assert/strict';
import { test } from 'node:test';
import { amountInput, formatMoney, parseAmountMinor } from '../src/shared/lib/money';

test('converts two-decimal input without floating-point rounding', () => {
  assert.equal(parseAmountMinor('12.34'), 1234n);
  assert.equal(parseAmountMinor('12,3'), 1230n);
  assert.equal(parseAmountMinor('0.01'), 1n);
  assert.equal(amountInput(1234n), '12.34');
});

test('rejects invalid and out-of-range amounts', () => {
  for (const value of ['0', '-1', '1.234', '1e3', 'abc', '1000000000']) {
    assert.equal(parseAmountMinor(value), null, value);
  }
});

test('formats supported currencies for an English-speaking Thailand locale', () => {
  assert.match(formatMoney(1234n, 'GEL'), /12\.34/);
  assert.match(formatMoney(1234n, 'USD'), /12\.34/);
  assert.match(formatMoney(1234n, 'THB'), /12\.34/);
  assert.match(formatMoney(1234n, 'THB'), /THB|฿/);
});
