import type { ResolvedElement } from '../models/layout';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Pure function to check if two rectangles overlap.
 * Uses standard AABB (Axis-Aligned Bounding Box) collision detection.
 */
export function rectanglesOverlap(a: Rect, b: Rect): boolean {
  // A rectangle overlaps another if it is NOT completely to the left, right, top, or bottom.
  // Using < and > implies edges touching does NOT count as an overlap, which is desired for layouts.
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Returns any placed elements that overlap with the candidate rectangle.
 * Hidden elements are ignored.
 */
export function getOverlappingElements(candidate: Rect, placedElements: ResolvedElement[]): ResolvedElement[] {
  return placedElements.filter(el => 
    el.visible && rectanglesOverlap(candidate, el)
  );
}
