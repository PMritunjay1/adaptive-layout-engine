import { describe, it, expect } from 'vitest';
import { DefaultValidationEngine } from '../engine/validation';
import type { ResolvedElement } from '../models/layout';
import type { SurfaceProfile } from '../models/surface';
import type { AdSpec, AdElementSpec } from '../models/ad-spec';

describe('Validation Engine', () => {
  const validator = new DefaultValidationEngine();
  
  const surface: SurfaceProfile = {
    id: 'test',
    width: 400,
    height: 800,
    minTextSize: 12,
    minTapTarget: 44,
    touchEnabled: true,
    safeArea: { top: 10, right: 10, bottom: 10, left: 10 }
  };

  const adSpec: AdSpec = {
    id: 'test-ad',
    elements: [
      {
        id: 'el-1',
        type: 'cta',
        priority: 1,
        minWidth: 44,
        minHeight: 44,
        degradation: { allowResize: false, allowReposition: false, allowTruncate: false, allowHide: false }
      } as AdElementSpec,
      {
        id: 'el-2',
        type: 'image',
        priority: 2,
        minWidth: 100,
        degradation: { allowResize: false, allowReposition: false, allowTruncate: false, allowHide: false }
      } as AdElementSpec
    ]
  };

  const createBaseElement = (id: string, x: number, y: number, w: number, h: number, visible: boolean = true): ResolvedElement => ({
    id, x, y, width: w, height: h, visible, priority: 1, state: visible ? 'placed' : 'hidden'
  });

  describe('detectOverlaps', () => {
    it('returns true when no elements overlap', () => {
      const elements = [
        createBaseElement('el-1', 50, 50, 100, 100),
        createBaseElement('el-2', 200, 200, 100, 100)
      ];
      const result = validator.detectOverlaps(elements);
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('returns false and reports overlapping elements', () => {
      const elements = [
        createBaseElement('el-1', 50, 50, 100, 100),
        createBaseElement('el-2', 100, 100, 100, 100) // Overlaps
      ];
      const result = validator.detectOverlaps(elements);
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('overlap');
    });

    it('ignores hidden elements during collision detection', () => {
      const elements = [
        createBaseElement('el-1', 50, 50, 100, 100),
        createBaseElement('el-2', 50, 50, 100, 100, false) // Hidden, but same coordinates
      ];
      const result = validator.detectOverlaps(elements);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBounds', () => {
    it('validates an element completely inside the usable area', () => {
      const el = createBaseElement('el-1', 20, 20, 100, 100);
      const result = validator.validateBounds(el, surface);
      expect(result.isValid).toBe(true);
    });

    it('flags an element that crosses outside the safe area', () => {
      const el = createBaseElement('el-1', 0, 0, 100, 100); // 0 < 10 (left safe area)
      const result = validator.validateBounds(el, surface);
      expect(result.isValid).toBe(false);
      expect(result.violations[0].type).toBe('out_of_bounds');
    });

    it('always considers hidden elements to be in-bounds', () => {
      const el = createBaseElement('el-1', -100, -100, 100, 100, false);
      const result = validator.validateBounds(el, surface);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateConstraints', () => {
    it('flags a CTA that is smaller than the minimum tap target', () => {
      const el = createBaseElement('el-1', 50, 50, 30, 30); // 30 < 44 tap target
      const result = validator.validateConstraints(el, surface, adSpec);
      expect(result.isValid).toBe(false);
      expect(result.violations[0].type).toBe('min_size');
    });

    it('flags an element that violates its explicit minWidth', () => {
      const el = createBaseElement('el-2', 50, 50, 50, 50); // 50 < 100 minWidth
      const result = validator.validateConstraints(el, surface, adSpec);
      expect(result.isValid).toBe(false);
      expect(result.violations[0].type).toBe('min_size');
    });
  });
});
