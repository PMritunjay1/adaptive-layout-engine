export type ElementLayoutState = 
  | 'placed'
  | 'repositioned'
  | 'resized'
  | 'truncated'
  | 'hidden';

export interface ResolvedElement {
  id: string;
  
  // Final calculated position and dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Resolution state
  visible: boolean;
  priority: number;
  state: ElementLayoutState;
  
  // Explainability metadata (e.g. "Reduced to 50% height due to constraint")
  reason?: string;
}

export interface ConstraintViolation {
  elementId?: string;
  type: 'overlap' | 'out_of_bounds' | 'min_size' | 'hard_constraint';
  message: string;
}

export interface ResolvedLayout {
  adId: string;
  surfaceId: string;
  
  // Effective dimensions for validation
  surfaceWidth: number;
  surfaceHeight: number;
  
  elements: ResolvedElement[];
  violations: ConstraintViolation[];
}
