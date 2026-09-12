import type { AnchorPosition } from '../models/ad-spec';
import type { Rect } from './collision';
import type { ResolvedElement } from '../models/layout';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates a specific geometric anchor point within a given area.
 */
export function getAnchorPoint(usableArea: Rect, elementWidth: number, elementHeight: number, anchor: AnchorPosition): Point {
  const { x, y, width, height } = usableArea;
  
  switch (anchor) {
    case 'top-left': return { x, y };
    case 'top-center': return { x: x + (width - elementWidth) / 2, y };
    case 'top-right': return { x: x + width - elementWidth, y };
    case 'center-left': return { x, y: y + (height - elementHeight) / 2 };
    case 'center': return { x: x + (width - elementWidth) / 2, y: y + (height - elementHeight) / 2 };
    case 'center-right': return { x: x + width - elementWidth, y: y + (height - elementHeight) / 2 };
    case 'bottom-left': return { x, y: y + height - elementHeight };
    case 'bottom-center': return { x: x + (width - elementWidth) / 2, y: y + height - elementHeight };
    case 'bottom-right': return { x: x + width - elementWidth, y: y + height - elementHeight };
    default: return { x, y };
  }
}

/**
 * Generates a deterministically ordered list of candidate points for an element.
 * The order represents the search priority:
 * 1. Preferred soft anchor
 * 2. Standard geometric anchors
 * 3. Generic adjacency to existing elements
 * 4. Grid sweep fallback
 */
export function generateCandidatePoints(
  usableArea: Rect,
  elementWidth: number,
  elementHeight: number,
  preferredAnchor?: AnchorPosition,
  placedElements: ResolvedElement[] = []
): Point[] {
  const candidates: Point[] = [];
  
  // 1. Preferred anchor region (soft preference)
  if (preferredAnchor) {
    candidates.push(getAnchorPoint(usableArea, elementWidth, elementHeight, preferredAnchor));
  }
  
  // 2. Other standard geometric anchors
  const anchors: AnchorPosition[] = [
    'top-center', 'bottom-center', 'center',
    'top-left', 'top-right', 'bottom-left', 'bottom-right',
    'center-left', 'center-right'
  ];
  
  for (const anchor of anchors) {
    if (anchor !== preferredAnchor) {
      candidates.push(getAnchorPoint(usableArea, elementWidth, elementHeight, anchor));
    }
  }

  // 3. Generic geometric adjacency to already placed rectangles
  for (const el of placedElements) {
    if (!el.visible) continue;
    
    // Below (aligned left, center, right)
    candidates.push({ x: el.x, y: el.y + el.height });
    candidates.push({ x: el.x + el.width / 2 - elementWidth / 2, y: el.y + el.height });
    candidates.push({ x: el.x + el.width - elementWidth, y: el.y + el.height });
    
    // Above (aligned left, center, right)
    candidates.push({ x: el.x, y: el.y - elementHeight });
    candidates.push({ x: el.x + el.width / 2 - elementWidth / 2, y: el.y - elementHeight });
    candidates.push({ x: el.x + el.width - elementWidth, y: el.y - elementHeight });
    
    // Right side (aligned top, center, bottom)
    candidates.push({ x: el.x + el.width, y: el.y });
    candidates.push({ x: el.x + el.width, y: el.y + el.height / 2 - elementHeight / 2 });
    candidates.push({ x: el.x + el.width, y: el.y + el.height - elementHeight });
    
    // Left side (aligned top, center, bottom)
    candidates.push({ x: el.x - elementWidth, y: el.y });
    candidates.push({ x: el.x - elementWidth, y: el.y + el.height / 2 - elementHeight / 2 });
    candidates.push({ x: el.x - elementWidth, y: el.y + el.height - elementHeight });
  }
  
  // 4. Grid sweep fallback to find any available pockets of space
  const stepX = Math.max(20, usableArea.width / 10);
  const stepY = Math.max(20, usableArea.height / 10);
  for (let gy = usableArea.y; gy <= usableArea.y + usableArea.height - elementHeight; gy += stepY) {
    for (let gx = usableArea.x; gx <= usableArea.x + usableArea.width - elementWidth; gx += stepX) {
      candidates.push({ x: gx, y: gy });
    }
  }

  // Deduplicate points to optimize the placement search
  const uniqueCandidates: Point[] = [];
  const seen = new Set<string>();
  for (const pt of candidates) {
    // Round to avoid float precision issues during Set lookup
    const key = `${Math.round(pt.x)},${Math.round(pt.y)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(pt);
    }
  }

  return uniqueCandidates;
}
