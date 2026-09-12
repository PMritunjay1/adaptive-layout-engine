import type { ResolvedLayout, ResolvedElement, ConstraintViolation } from '../models/layout';
import type { SurfaceProfile } from '../models/surface';
import type { AdSpec } from '../models/ad-spec';
import { rectanglesOverlap } from './collision';
import { isWithinBounds, getUsableArea } from './bounds';

export interface ValidationResult {
  isValid: boolean;
  violations: ConstraintViolation[];
}

export class DefaultValidationEngine {
  
  validateBounds(element: ResolvedElement, surface: SurfaceProfile): ValidationResult {
    if (!element.visible) return { isValid: true, violations: [] };
    
    const usable = getUsableArea(surface);
    const valid = isWithinBounds(element, usable);
    
    if (!valid) {
       return {
         isValid: false,
         violations: [{
           elementId: element.id,
           type: 'out_of_bounds',
           message: `Element ${element.id} is outside the usable surface bounds.`
         }]
       };
    }
    return { isValid: true, violations: [] };
  }
  
  detectOverlaps(elements: ResolvedElement[]): ValidationResult {
    const visibleElements = elements.filter(e => e.visible);
    const violations: ConstraintViolation[] = [];
    
    for (let i = 0; i < visibleElements.length; i++) {
      for (let j = i + 1; j < visibleElements.length; j++) {
        if (rectanglesOverlap(visibleElements[i], visibleElements[j])) {
          violations.push({
            type: 'overlap',
            message: `Elements ${visibleElements[i].id} and ${visibleElements[j].id} overlap.`
          });
        }
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }
  
  validateConstraints(element: ResolvedElement, surface: SurfaceProfile, spec: AdSpec): ValidationResult {
    if (!element.visible) return { isValid: true, violations: [] };
    
    const violations: ConstraintViolation[] = [];
    const elSpec = spec.elements.find(e => e.id === element.id);
    
    // Min tap target for CTAs
    if (elSpec?.type === 'cta' && surface.minTapTarget) {
      if (element.width < surface.minTapTarget || element.height < surface.minTapTarget) {
        violations.push({
          elementId: element.id,
          type: 'min_size',
          message: `Element ${element.id} violates minimum tap target of ${surface.minTapTarget}px.`
        });
      }
    }
    
    // Explicit min size validations
    if (elSpec?.minWidth && element.width < elSpec.minWidth) {
        violations.push({
          elementId: element.id,
          type: 'min_size',
          message: `Element ${element.id} violates minimum width.`
        });
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
  
  validateFinalLayout(layout: ResolvedLayout, spec: AdSpec, surface: SurfaceProfile): ValidationResult {
    const allViolations: ConstraintViolation[] = [];
    
    const overlapResult = this.detectOverlaps(layout.elements);
    allViolations.push(...overlapResult.violations);
    
    for (const el of layout.elements) {
      const boundsResult = this.validateBounds(el, surface);
      allViolations.push(...boundsResult.violations);
      
      const constraintResult = this.validateConstraints(el, surface, spec);
      allViolations.push(...constraintResult.violations);
    }
    
    return {
      isValid: allViolations.length === 0,
      violations: allViolations
    };
  }
}
