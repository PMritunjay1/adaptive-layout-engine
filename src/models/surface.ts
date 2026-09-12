export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string; // E.g., "mobile-portrait", "kiosk", "custom-1"
  
  // Base dimensions
  width: number;
  height: number;
  
  // Usable area constraints
  safeArea: SafeArea;
  
  // Specific constraints
  minTextSize: number;
  minTapTarget?: number;
  
  // Contextual attributes
  viewingDistance?: number;
  touchEnabled?: boolean;
}
