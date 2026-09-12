import { describe, it, expect } from 'vitest';
import { resolveLayout } from '../engine/resolver';
import { sampleAd } from '../data/sample-ad';
import type { SurfaceProfile } from '../models/surface';
import type { ResolvedLayout } from '../models/layout';
import type { AdSpec } from '../models/ad-spec';

// Helper for invariant checking
function assertValidResolvedLayout(layout: ResolvedLayout, surface: SurfaceProfile) {
  // 1. Final validation flag
  expect(layout.violations).toHaveLength(0);

  const visible = layout.elements.filter(e => e.visible);

  // 2. Usable bounds limits
  const minX = surface.safeArea.left;
  const minY = surface.safeArea.top;
  const maxX = surface.width - surface.safeArea.right;
  const maxY = surface.height - surface.safeArea.bottom;

  for (const el of visible) {
    expect(el.x).toBeGreaterThanOrEqual(minX);
    expect(el.y).toBeGreaterThanOrEqual(minY);
    expect(el.x + el.width).toBeLessThanOrEqual(maxX);
    expect(el.y + el.height).toBeLessThanOrEqual(maxY);
  }

  // 3. No overlaps
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i];
      const b = visible[j];
      const overlaps = 
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
      expect(overlaps).toBe(false);
    }
  }
}

describe('Resolver Engine Integration', () => {
  const largeSurface: SurfaceProfile = {
    id: 'large',
    width: 1024,
    height: 1024,
    minTextSize: 12,
    minTapTarget: 44,
    touchEnabled: true,
    safeArea: { top: 20, right: 20, bottom: 20, left: 20 }
  };

  it('Test A: Basic successful resolution', () => {
    const layout = resolveLayout(sampleAd, largeSurface);
    assertValidResolvedLayout(layout, largeSurface);
    expect(layout.elements.every(e => e.visible)).toBe(true);
    expect(layout.elements.every(e => e.state === 'placed')).toBe(true);
  });

  it('Test B: Same spec, different aspect ratio', () => {
    const wideSurface: SurfaceProfile = { ...largeSurface, width: 2000, height: 400 };
    const tallSurface: SurfaceProfile = { ...largeSurface, width: 400, height: 2000 };
    const squareSurface: SurfaceProfile = { ...largeSurface, width: 800, height: 800 };

    const wideLayout = resolveLayout(sampleAd, wideSurface);
    const tallLayout = resolveLayout(sampleAd, tallSurface);
    const squareLayout = resolveLayout(sampleAd, squareSurface);

    assertValidResolvedLayout(wideLayout, wideSurface);
    assertValidResolvedLayout(tallLayout, tallSurface);
    assertValidResolvedLayout(squareLayout, squareSurface);

    // Layouts must adapt and be meaningfully different geometrically
    // We check that the elements aren't just placed identically despite surface changes
    expect(wideLayout).not.toEqual(tallLayout);
    expect(tallLayout).not.toEqual(squareLayout);
  });

  it('Unknown Surface Test: works on entirely arbitrary sizes without modification', () => {
    const weirdSurface: SurfaceProfile = {
      id: 'custom-surface',
      width: 1373,
      height: 417,
      minTextSize: 12,
      minTapTarget: 44,
      safeArea: { top: 13, right: 27, bottom: 9, left: 18 }
    };
    const layout = resolveLayout(sampleAd, weirdSurface);
    assertValidResolvedLayout(layout, weirdSurface);
  });

  it('Priority / Degradation Test: preserves high priority, degrades low priority', () => {
    const constrainedSurface: SurfaceProfile = {
      id: 'constrained',
      width: 250,
      height: 350, // Very tight for 6 elements, fits 100x100 image + price tag, degrades secText
      minTextSize: 12,
      minTapTarget: 44,
      safeArea: { top: 10, right: 10, bottom: 10, left: 10 }
    };

    const layout = resolveLayout(sampleAd, constrainedSurface);
    
    // Valid layout should still be returned, utilizing degradation
    assertValidResolvedLayout(layout, constrainedSurface);

    const cta = layout.elements.find(e => e.id === 'cta-btn'); // priority 1
    const secText = layout.elements.find(e => e.id === 'secondary-txt'); // priority 6

    expect(cta).toBeDefined();
    expect(secText).toBeDefined();

    // CTA must be preserved as placed or minimally resized
    expect(['placed', 'resized']).toContain(cta!.state);
    
    // Secondary text should be aggressively degraded or hidden
    expect(['truncated', 'hidden', 'resized']).toContain(secText!.state);
    
    // In a tight space, the low priority element state should be worse/equal to high priority
    // Using a rough hierarchy of states: placed > resized > truncated > hidden
    const score: Record<string, number> = { 'placed': 4, 'resized': 3, 'truncated': 2, 'hidden': 1, 'repositioned': 4 };
    expect(score[cta!.state]).toBeGreaterThanOrEqual(score[secText!.state]);
  });

  it('Hide Test: hiding a low-priority element does not cause collision failures', () => {
    const customAd: AdSpec = {
      id: 'hide-ad',
      elements: [
        {
          id: 'essential', type: 'cta', priority: 1, minWidth: 100, minHeight: 100,
          degradation: { allowResize: false, allowReposition: true, allowTruncate: false, allowHide: false }
        },
        {
          id: 'optional', type: 'secondaryText', priority: 2, minWidth: 100, minHeight: 100,
          degradation: { allowResize: false, allowReposition: true, allowTruncate: false, allowHide: true }
        }
      ]
    };
    
    const tinySurface: SurfaceProfile = {
      ...largeSurface,
      width: 150, // Big enough for one 100x100 element, but not two
      height: 150,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 }
    };
    const layout = resolveLayout(customAd, tinySurface);
    
    // Layout should be technically valid (because it hid the optional element)
    assertValidResolvedLayout(layout, tinySurface);
    
    const optional = layout.elements.find(e => e.id === 'optional');
    expect(optional!.visible).toBe(false);
    expect(optional!.state).toBe('hidden');
    expect(optional!.width).toBe(0);
    expect(optional!.height).toBe(0);
  });

  it('Required Element Test: impossible constraints emit structured validation failures', () => {
    // CTA has allowHide = false and minWidth = 120. Surface width = 100.
    const impossibleSurface: SurfaceProfile = {
      ...largeSurface,
      width: 100, // smaller than CTA minWidth
      height: 100,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 }
    };

    const layout = resolveLayout(sampleAd, impossibleSurface);
    
    // Must NOT be silent
    expect(layout.violations.length).toBeGreaterThan(0);
    
    const cta = layout.elements.find(e => e.id === 'cta-btn');
    expect(cta!.state).toBe('hidden'); // Emitted as hidden because it failed to place
    expect(cta!.visible).toBe(false);
    
    // The violation MUST exist indicating it violated a hard constraint (allowHide is false)
    const ctaViolation = layout.violations.find(v => v.elementId === 'cta-btn' && v.type === 'hard_constraint');
    expect(ctaViolation).toBeDefined();
  });

  it('Safe Area Test: strict asymmetric boundaries are respected', () => {
    const asymmetricSurface: SurfaceProfile = {
      ...largeSurface,
      width: 500,
      height: 500,
      safeArea: { top: 20, right: 70, bottom: 50, left: 30 }
    };
    
    const layout = resolveLayout(sampleAd, asymmetricSurface);
    assertValidResolvedLayout(layout, asymmetricSurface);
  });

  it('Determinism Test: exact same inputs produce identical layouts', () => {
    const layout1 = resolveLayout(sampleAd, largeSurface);
    const layout2 = resolveLayout(sampleAd, largeSurface);
    
    // Must be completely structurally identical
    expect(layout1).toEqual(layout2);
  });

  it('Surface-Name Independence Test: different surface IDs with same constraints yield same layout', () => {
    const surfaceA: SurfaceProfile = { ...largeSurface, id: 'mobile' };
    const surfaceB: SurfaceProfile = { ...largeSurface, id: 'completely-random' };
    
    const layoutA = resolveLayout(sampleAd, surfaceA);
    const layoutB = resolveLayout(sampleAd, surfaceB);
    
    // Strip the surfaceId from the layout to compare identical placements
    const { surfaceId: idA, ...restA } = layoutA;
    const { surfaceId: idB, ...restB } = layoutB;
    
    expect(restA).toEqual(restB);
  });

  it('Preferred Position Test: preference influences candidate ordering', () => {
    // Create an ad with a single element preferring 'bottom-right'
    const customAd: AdSpec = {
      id: 'test',
      elements: [{
        id: 'el', type: 'cta', priority: 1, preferredPosition: 'bottom-right',
        minWidth: 100, minHeight: 100,
        degradation: { allowResize: false, allowReposition: true, allowTruncate: false, allowHide: false }
      }]
    };
    
    const layout = resolveLayout(customAd, largeSurface);
    const el = layout.elements[0];
    
    // The element should have been organically placed at the bottom right of the usable area
    const usableRight = largeSurface.width - largeSurface.safeArea.right;
    const usableBottom = largeSurface.height - largeSurface.safeArea.bottom;
    
    expect(el.x + el.width).toBe(usableRight);
    expect(el.y + el.height).toBe(usableBottom);
  });

  it('Property-style Matrix Test: unusual dimensions resolve safely if possible', () => {
    const matrices = [
      { width: 320, height: 640 },
      { width: 640, height: 320 },
      { width: 1024, height: 1024 },
      { width: 1440, height: 420 },
      { width: 1732, height: 317 },
      { width: 400, height: 400 },
      { width: 2000, height: 200 }
    ];

    for (const dims of matrices) {
      const surface: SurfaceProfile = {
        ...largeSurface,
        width: dims.width,
        height: dims.height
      };
      
      const layout = resolveLayout(sampleAd, surface);
      
      // If it fits, it's valid. If it doesn't fit, it must report violations.
      // We are just asserting it doesn't throw and respects invariants for whatever elements it DID place.
      if (layout.violations.length === 0) {
        assertValidResolvedLayout(layout, surface);
      }
    }
  });
});
