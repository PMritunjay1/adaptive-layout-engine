import type { AdElementSpec } from '../models/ad-spec';
import type { ElementLayoutState } from '../models/layout';
import type { SurfaceProfile } from '../models/surface';

export interface DegradationState {
  width: number;
  height: number;
  state: ElementLayoutState;
  reason: string;
}

/**
 * Generates a deterministically ordered sequence of degradation states for an element.
 * The engine will attempt to place the element using these states in order.
 * If all states fail, the engine will hide the element (if permitted) or fail.
 */
export function generateDegradationSequence(
  spec: AdElementSpec,
  surface: SurfaceProfile
): DegradationState[] {
  const sequence: DegradationState[] = [];
  
  // Base dimensions (fallback to a sensible default if not provided)
  const baseW = spec.preferredWidth || spec.minWidth || Math.min(200, surface.width);
  const baseH = spec.preferredHeight || spec.minHeight || (spec.aspectRatio ? Math.floor(baseW / spec.aspectRatio) : Math.min(50, surface.height));
  
  // Minimums defined by the element or surface constraints (like tap target)
  const rawMinW = spec.minWidth || (spec.type === 'cta' ? (surface.minTapTarget || 44) : 50);
  const rawMinH = spec.minHeight || (spec.aspectRatio ? Math.floor(rawMinW / spec.aspectRatio) : (spec.type === 'cta' ? (surface.minTapTarget || 44) : 24));
  
  // Apply surface minimums if applicable
  const surfaceMin = surface.touchEnabled && ['cta', 'button', 'link'].includes(spec.type) ? (surface.minTapTarget || 0) : 0;
  
  const minW = Math.max(rawMinW, surfaceMin);
  const minH = Math.max(rawMinH, surfaceMin);
  
  const defaultW = Math.max(baseW, minW);
  const defaultH = Math.max(baseH, minH);
  
  // 1. Original Preferred Size
  sequence.push({
    width: defaultW,
    height: defaultH,
    state: 'placed',
    reason: 'Original preferred size'
  });
  
  // 2. Resized
  if (spec.degradation.allowResize) {
    // Intermediate resize (e.g. 75%)
    const midW = Math.max(minW, Math.floor(defaultW * 0.75));
    const midH = spec.aspectRatio 
      ? Math.floor(midW / spec.aspectRatio) 
      : Math.max(minH, Math.floor(defaultH * 0.75));
      
    if (midW < defaultW || midH < defaultH) {
      sequence.push({
        width: midW,
        height: midH,
        state: 'resized',
        reason: 'Resized to intermediate dimensions'
      });
    }
    
    // Absolute minimum size
    const absoluteMinH = spec.aspectRatio ? Math.floor(minW / spec.aspectRatio) : minH;
    if (minW < midW || absoluteMinH < midH) {
      sequence.push({
        width: minW,
        height: absoluteMinH,
        state: 'resized',
        reason: 'Resized to minimum allowed constraints'
      });
    }
  }
  
  // 3. Truncated
  if (spec.degradation.allowTruncate) {
     // Truncation means the content can be cut off to satisfy the physical minimum constraints.
     // It MUST NOT violate the absolute hard constraints defined by minW / minH.
     const absoluteMinH = spec.aspectRatio ? Math.floor(minW / spec.aspectRatio) : minH;
     sequence.push({
        width: minW,
        height: absoluteMinH,
        state: 'truncated',
        reason: 'Truncated content to fit physical minimum constraints'
     });
  }

  // Deduplicate sequence states that resolve to the exact same dimensions
  const uniqueSequence: DegradationState[] = [];
  const seen = new Set<string>();
  
  for (const state of sequence) {
    const key = `${state.width}x${state.height}-${state.state}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSequence.push(state);
    }
  }

  return uniqueSequence;
}
