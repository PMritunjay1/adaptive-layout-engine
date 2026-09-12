import type { SurfaceProfile } from '../models/surface';

export const sampleSurfaces: SurfaceProfile[] = [
  {
    id: "mobile-portrait",
    width: 375,
    height: 812,
    safeArea: { top: 44, right: 16, bottom: 34, left: 16 },
    minTextSize: 12,
    minTapTarget: 44,
    touchEnabled: true
  },
  {
    id: "mobile-landscape",
    width: 812,
    height: 375,
    safeArea: { top: 16, right: 44, bottom: 21, left: 44 },
    minTextSize: 12,
    minTapTarget: 44,
    touchEnabled: true
  },
  {
    id: "broadcast-lower-third",
    width: 1920,
    height: 250,
    safeArea: { top: 20, right: 120, bottom: 40, left: 120 },
    minTextSize: 24,
    minTapTarget: 0,
    touchEnabled: false
  },
  {
    id: "square-kiosk",
    width: 1080,
    height: 1080,
    safeArea: { top: 60, right: 60, bottom: 60, left: 60 },
    minTextSize: 18,
    minTapTarget: 60,
    touchEnabled: true
  }
];
