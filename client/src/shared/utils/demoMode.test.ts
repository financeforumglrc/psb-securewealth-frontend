import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isJudgeMode, formatCurrency, getTimeAgo } from '@/shared/utils/demoMode';

describe('demoMode utils', () => {
  describe('isJudgeMode', () => {
    beforeEach(() => {
      // @ts-expect-error readonly assignment for test
      window.location = { search: '' };
    });

    it('returns false when judge param is absent', () => {
      expect(isJudgeMode()).toBe(false);
    });

    it('returns true for ?judge=true', () => {
      // @ts-expect-error readonly assignment for test
      window.location = { search: '?judge=true' };
      expect(isJudgeMode()).toBe(true);
    });

    it('returns true for ?judge=1', () => {
      // @ts-expect-error readonly assignment for test
      window.location = { search: '?judge=1' };
      expect(isJudgeMode()).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('formats crore values', () => {
      expect(formatCurrency(25000000)).toBe('₹2.50 Cr');
    });

    it('formats lakh values', () => {
      expect(formatCurrency(550000)).toBe('₹5.5 L');
    });

    it('formats small values with Indian grouping', () => {
      expect(formatCurrency(1500)).toBe('₹1,500');
    });
  });

  describe('getTimeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns Just now for recent timestamps', () => {
      expect(getTimeAgo(new Date(Date.now() - 30_000).toISOString())).toBe('Just now');
    });

    it('returns minutes for recent past', () => {
      expect(getTimeAgo(new Date(Date.now() - 5 * 60_000).toISOString())).toBe('5m ago');
    });

    it('returns hours for same day', () => {
      expect(getTimeAgo(new Date(Date.now() - 3 * 3600_000).toISOString())).toBe('3h ago');
    });

    it('returns days for older timestamps', () => {
      expect(getTimeAgo(new Date(Date.now() - 2 * 86400_000).toISOString())).toBe('2d ago');
    });
  });
});
