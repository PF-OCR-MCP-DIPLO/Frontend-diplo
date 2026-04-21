import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

describe('format utils', () => {
  it('formats currency for numeric inputs', () => {
    const formatted = formatCurrency(50000);
    expect(formatted).toEqual(expect.any(String));
    expect(formatted).toMatch(/50/);
  });

  it('returns original value when it is not numeric', () => {
    expect(formatCurrency('abc')).toBe('abc');
  });

  it('formats date time', () => {
    const formatted = formatDateTime(new Date('2026-04-21T10:00:00Z'));
    expect(formatted).toEqual(expect.any(String));
  });
});

