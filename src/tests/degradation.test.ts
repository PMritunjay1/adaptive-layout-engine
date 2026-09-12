import { describe, it, expect } from 'vitest';
import { generateDegradationSequence } from '../engine/degradation';
import type { AdElementSpec } from '../models/ad-spec';
import type { SurfaceProfile } from '../models/surface';

describe('Degradation Engine', () => {
  const surface: SurfaceProfile = {
    id: 'test',
    width: 400,
    height: 800,
    minTextSize: 12,
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 }
  };

  const baseSpec: AdElementSpec = {
    id: 'el-1',
    type: 'headline',
    priority: 1,
    preferredWidth: 200,
    preferredHeight: 100,
    minWidth: 100,
    minHeight: 50,
    degradation: {
      allowResize: false,
      allowReposition: true, // Repositioning is handled by candidates, not dimension state
      allowTruncate: false,
      allowHide: false
    }
  };

  it('generates only the original state if all degradation policies are disabled', () => {
    const states = generateDegradationSequence(baseSpec, surface);
    expect(states).toHaveLength(1);
    expect(states[0]).toEqual({
      width: 200,
      height: 100,
      state: 'placed',
      reason: 'Original preferred size'
    });
  });

  it('attempts smaller dimensions while respecting minimum dimensions when resize is allowed', () => {
    const resizableSpec: AdElementSpec = {
      ...baseSpec,
      degradation: { ...baseSpec.degradation, allowResize: true }
    };
    
    const states = generateDegradationSequence(resizableSpec, surface);
    // Should have placed, resized (intermediate 75%), resized (minimums)
    expect(states.length).toBeGreaterThan(1);
    
    // Check first state
    expect(states[0].state).toBe('placed');
    expect(states[0].width).toBe(200);
    
    // Check minimum state
    const minState = states[states.length - 1];
    expect(minState.state).toBe('resized');
    expect(minState.width).toBe(100);
    expect(minState.height).toBe(50);
  });

  it('truncation does not reduce dimensions below hard minimums', () => {
    const truncatableSpec: AdElementSpec = {
      ...baseSpec,
      degradation: { ...baseSpec.degradation, allowTruncate: true }
    };
    
    const states = generateDegradationSequence(truncatableSpec, surface);
    
    const truncState = states.find(s => s.state === 'truncated');
    expect(truncState).toBeDefined();
    
    // Width and height MUST NOT be smaller than minWidth/minHeight
    expect(truncState!.width).toBeGreaterThanOrEqual(100);
    expect(truncState!.height).toBeGreaterThanOrEqual(50);
  });

  it('preserves aspect ratio during resize if defined', () => {
    const aspectSpec: AdElementSpec = {
      ...baseSpec,
      aspectRatio: 2, // Width is 2x height
      degradation: { ...baseSpec.degradation, allowResize: true }
    };
    
    const states = generateDegradationSequence(aspectSpec, surface);
    
    for (const state of states) {
       // Allow small float rounding differences
       expect(Math.abs(state.width / state.height - 2)).toBeLessThan(0.1);
    }
  });
  
  it('does not produce a hidden state (hiding is resolved by the resolver if placement fails)', () => {
    const hideableSpec: AdElementSpec = {
      ...baseSpec,
      degradation: { ...baseSpec.degradation, allowHide: true }
    };
    
    const states = generateDegradationSequence(hideableSpec, surface);
    const hasHidden = states.some(s => s.state === 'hidden');
    expect(hasHidden).toBe(false);
  });
});
