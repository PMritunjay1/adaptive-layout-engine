export type AdElementType = 
  | 'headline'
  | 'image'
  | 'price'
  | 'cta'
  | 'branding'
  | 'secondaryText';

export interface DegradationPolicy {
  allowResize: boolean;
  allowReposition: boolean;
  allowTruncate: boolean;
  allowHide: boolean;
}

export type AnchorPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface AdElementSpec {
  id: string;
  type: AdElementType;
  priority: number; // Lower number means higher priority (e.g., 1 is most important)
  degradation: DegradationPolicy;
  preferredPosition?: AnchorPosition;
  
  // Element content
  content?: string;
  imageUrl?: string;
  
  // Intrinsic preferences (independent of surface constraints)
  preferredWidth?: number;
  preferredHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
}

export interface AdSpec {
  id: string;
  elements: AdElementSpec[];
}
