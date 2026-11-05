import { describe, expect, it } from 'vitest';
import { getWeekDateKeys, getWeekdayName, toDateKey } from './dates.js';

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('getWeekDateKeys', () => {
  const week = [
    '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05',
    '2026-11-06', '2026-11-07', '2026-11-08',
  ];

  it('runs Monday to Sunday for a midweek date', () => {
    expect(getWeekDateKeys('2026-11-05')).toEqual(week);
  });

  it('treats Monday as the first day', () => {
    expect(getWeekDateKeys('2026-11-02')).toEqual(week);
  });

  it('treats Sunday as the last day, not the start of the next week', () => {
    expect(getWeekDateKeys('2026-11-08')).toEqual(week);
  });

  it('crosses month and year boundaries', () => {
    expect(getWeekDateKeys('2027-01-01')).toEqual([
      '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31',
      '2027-01-01', '2027-01-02', '2027-01-03',
    ]);
  });

  it('starts on Monday and ends on Sunday', () => {
    const keys = getWeekDateKeys('2026-03-29');
    expect(getWeekdayName(keys[0])).toBe('Monday');
    expect(getWeekdayName(keys[6])).toBe('Sunday');
  });
});
