import type { AdSpec } from '../models/ad-spec';
import type { SurfaceProfile } from '../models/surface';
import type { ResolvedLayout, ResolvedElement } from '../models/layout';
import { getUsableArea, isWithinBounds } from './bounds';
import { getOverlappingElements } from './collision';
import { generateDegradationSequence } from './degradation';
import { generateCandidatePoints } from './candidates';
import { DefaultValidationEngine } from './validation';

/**
 * Resolves an AdSpec against a SurfaceProfile to produce a deterministic, valid layout.
 * The pipeline strictly follows: Validates -> Sorts -> Candidates -> Collisions -> Degradation -> Validates.
 */
export function resolveLayout(adSpec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const usableArea = getUsableArea(surface);
  
  // Order elements by priority (lower number = higher priority)
  const sortedElements = [...adSpec.elements].sort((a, b) => a.priority - b.priority);
  
  const resolvedElements: ResolvedElement[] = [];
  
  for (const elementSpec of sortedElements) {
    let placed = false;
    let decisionTrace = '';
    
    // 1. Generate permitted states (Preferred -> Resized -> Truncated)
    const states = generateDegradationSequence(elementSpec, surface);
    
    for (const state of states) {
      if (placed) break;
      let stateTrace = `\n- Attempted ${state.state} (${state.width}x${state.height}): `;
      
      // 2. Generate geometric candidates based on usable area and already placed elements
      const candidates = generateCandidatePoints(
        usableArea,
        state.width,
        state.height,
        elementSpec.preferredPosition,
        resolvedElements
      );
      
      let boundsRejections = 0;
      let overlapRejections = 0;
      
      for (const pt of candidates) {
        const candidateRect = {
          x: pt.x,
          y: pt.y,
          width: state.width,
          height: state.height
        };
        
        // 3. Strict bounds validation
        if (!isWithinBounds(candidateRect, usableArea)) {
          boundsRejections++;
          continue;
        }
        
        // 4. Strict collision detection
        const overlaps = getOverlappingElements(candidateRect, resolvedElements);
        if (overlaps.length > 0) {
          overlapRejections++;
          continue;
        }
        
        // Valid placement found
        resolvedElements.push({
          id: elementSpec.id,
          x: candidateRect.x,
          y: candidateRect.y,
          width: candidateRect.width,
          height: candidateRect.height,
          visible: true,
          priority: elementSpec.priority,
          state: state.state,
          reason: decisionTrace + stateTrace + `Accepted candidate at ${pt.x}, ${pt.y}`
        });
        
        placed = true;
        break; // Successfully placed, break candidates loop
      }
      
      if (!placed) {
        decisionTrace += stateTrace + `Rejected (bounds: ${boundsRejections}, overlap: ${overlapRejections})`;
      }
    }
    
    // 5. Hide or fail if space is insufficient after all degradation attempts
    if (!placed) {
      if (elementSpec.degradation.allowHide) {
        resolvedElements.push({
          id: elementSpec.id,
          x: 0, y: 0, width: 0, height: 0,
          visible: false,
          priority: elementSpec.priority,
          state: 'hidden',
          reason: decisionTrace + `\n- Hide attempted: Accepted`
        });
      } else {
        // Cannot hide, but also cannot place. We emit it as hidden but the final validator will catch it.
        resolvedElements.push({
          id: elementSpec.id,
          x: 0, y: 0, width: 0, height: 0,
          visible: false,
          priority: elementSpec.priority,
          state: 'hidden', // Conceptually a fatal failure state
          reason: decisionTrace + `\n- Hide attempted: Rejected (fatal hard constraint violation)`
        });
      }
    }
  }
  
  const layout: ResolvedLayout = {
    adId: adSpec.id,
    surfaceId: surface.id,
    surfaceWidth: surface.width,
    surfaceHeight: surface.height,
    elements: resolvedElements,
    violations: []
  };
  
  // 6. Final Validation Pass
  const validator = new DefaultValidationEngine();
  const validationResult = validator.validateFinalLayout(layout, adSpec, surface);
  layout.violations = validationResult.violations;
  
  // We explicitly check if there's a hard constraint violation on non-hideable elements
  for (const element of resolvedElements) {
      if (!element.visible) {
          const spec = adSpec.elements.find(e => e.id === element.id);
          if (spec && !spec.degradation.allowHide) {
             layout.violations.push({
                 elementId: element.id,
                 type: 'hard_constraint',
                 message: `Element ${element.id} is hidden but its degradation policy does not allow hiding.`
             });
          }
      }
  }
  
  return layout;
}
