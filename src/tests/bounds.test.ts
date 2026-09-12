import { describe, it, expect } from 'vitest';
import { getUsableArea, isWithinBounds } from '../engine/bounds';
import type { SurfaceProfile } from '../models/surface';
import type { Rect } from '../engine/collision';

describe('Bounds Engine', () => {
  const surface: SurfaceProfile = {
    id: 'test-surface',
    width: 400,
    height: 800,
    minTextSize: 12,
    safeArea: {
      top: 20,
      right: 30,
      bottom: 40,
      left: 10
    }
  };

  describe('getUsableArea', () => {
    it('calculates the usable region correctly accounting for asymmetric safe areas', () => {
      const usable = getUsableArea(surface);
      expect(usable).toEqual({
        x: 10, // left
        y: 20, // top
        width: 360, // 400 - 10 - 30
        height: 740 // 800 - 20 - 40
      });
    });
  });

  describe('isWithinBounds', () => {
    const usableArea: Rect = { x: 10, y: 20, width: 360, height: 740 };

    it('returns true for an element fully inside the usable area', () => {
      const candidate: Rect = { x: 50, y: 50, width: 100, height: 100 };
      expect(isWithinBounds(candidate, usableArea)).toBe(true);
    });

    it('returns true for an element exactly touching the safe-area boundaries', () => {
      const candidate: Rect = { x: 10, y: 20, width: 360, height: 740 };
      expect(isWithinBounds(candidate, usableArea)).toBe(true);
    });

    it('returns false for an element partially outside (left edge)', () => {
      const candidate: Rect = { x: 5, y: 50, width: 100, height: 100 };
      expect(isWithinBounds(candidate, usableArea)).toBe(false);
    });

    it('returns false for an element partially outside (right edge)', () => {
      const candidate: Rect = { x: 300, y: 50, width: 100, height: 100 }; // 300 + 100 = 400 > 370 (10 + 360)
      expect(isWithinBounds(candidate, usableArea)).toBe(false);
    });

    it('returns false for an element partially outside (top edge)', () => {
      const candidate: Rect = { x: 50, y: 10, width: 100, height: 100 };
      expect(isWithinBounds(candidate, usableArea)).toBe(false);
    });

    it('returns false for an element partially outside (bottom edge)', () => {
      const candidate: Rect = { x: 50, y: 700, width: 100, height: 100 }; // 700 + 100 = 800 > 760 (20 + 740)
      expect(isWithinBounds(candidate, usableArea)).toBe(false);
    });

    it('returns false for an element completely outside the usable area', () => {
      const candidate: Rect = { x: 500, y: 900, width: 100, height: 100 };
      expect(isWithinBounds(candidate, usableArea)).toBe(false);
    });

    it('handles zero dimensions safely as long as coordinates are within bounds', () => {
      const candidate: Rect = { x: 50, y: 50, width: 0, height: 0 };
      expect(isWithinBounds(candidate, usableArea)).toBe(true);
    });
  });
});
