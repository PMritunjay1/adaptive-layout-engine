import { describe, it, expect } from 'vitest';
import { rectanglesOverlap } from '../engine/collision';
import type { Rect } from '../engine/collision';

describe('Collision Engine (AABB)', () => {
  it('detects no overlap for completely separate rectangles', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 200, y: 200, width: 100, height: 100 };
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it('detects no overlap for horizontally adjacent rectangles touching exactly on the edge', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 100, y: 0, width: 100, height: 100 };
    // The right edge of A is 100. The left edge of B is 100. They touch but do not overlap.
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it('detects no overlap for vertically adjacent rectangles touching exactly on the edge', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 0, y: 100, width: 100, height: 100 };
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it('detects partial overlap', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 50, y: 50, width: 100, height: 100 };
    expect(rectanglesOverlap(a, b)).toBe(true);
  });

  it('detects complete containment (A inside B)', () => {
    const a: Rect = { x: 25, y: 25, width: 50, height: 50 };
    const b: Rect = { x: 0, y: 0, width: 100, height: 100 };
    expect(rectanglesOverlap(a, b)).toBe(true);
    expect(rectanglesOverlap(b, a)).toBe(true); // Commutative property
  });

  it('detects overlap for identical rectangles', () => {
    const a: Rect = { x: 10, y: 10, width: 100, height: 100 };
    const b: Rect = { x: 10, y: 10, width: 100, height: 100 };
    expect(rectanglesOverlap(a, b)).toBe(true);
  });
});
