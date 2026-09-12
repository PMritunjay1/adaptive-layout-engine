import type { SurfaceProfile } from '../models/surface';
import type { Rect } from './collision';

/**
 * Calculates the usable rectangular area of a surface,
 * taking safe margins into account.
 */
export function getUsableArea(surface: SurfaceProfile): Rect {
  return {
    x: surface.safeArea.left,
    y: surface.safeArea.top,
    width: surface.width - surface.safeArea.left - surface.safeArea.right,
    height: surface.height - surface.safeArea.top - surface.safeArea.bottom
  };
}

/**
 * Checks if a candidate rectangle fits strictly within the allowed bounds.
 */
export function isWithinBounds(candidate: Rect, bounds: Rect): boolean {
  return (
    candidate.x >= bounds.x &&
    candidate.y >= bounds.y &&
    candidate.x + candidate.width <= bounds.x + bounds.width &&
    candidate.y + candidate.height <= bounds.y + bounds.height
  );
}
