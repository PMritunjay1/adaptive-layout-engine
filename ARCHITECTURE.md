# Adaptive Layout Engine Architecture

## Resolver Entry Point
The entry point for the layout engine is `resolveLayout(adSpec: AdSpec, surface: SurfaceProfile): ResolvedLayout` located in `src/engine/resolver.ts`. It takes a declarative ad specification and surface constraint profile, and returns a fully deterministic layout containing absolute coordinates for every element.

## Resolution Stages
1. **Normalization & Setup**: Calculate the usable area of the surface by subtracting the safe area from the absolute dimensions.
2. **Prioritization**: Order elements by their priority integer (ascending).
3. **Candidate Placement Loop**:
   - For each element, generate a sequence of allowed **degradation states** (e.g., original size -> resized -> truncated).
   - For each state, generate geometric **candidate anchor points** (e.g., preferred position -> standard edges -> adjacent to existing elements).
   - Iterate through candidates checking for **bounds violations** and **collisions**. The first valid candidate is accepted.
4. **Degradation / Failure Handling**: If an element cannot be placed across any permitted state or position, it is hidden (if allowed by its policy) or marked as a fatal constraint failure.
5. **Final Validation**: The completed layout undergoes a rigorous check against all invariants to guarantee structural integrity.

## Resolution Outcomes

The resolver attempts to produce a valid layout under the supplied constraints. Final validation guarantees that invalid layouts are not silently accepted. 

### Valid Result
The resolver returns a valid layout (`isValid: true` in validation) when all hard constraints (bounds, overlaps, tap targets) and element presence requirements (if `allowHide` is false) can be satisfied.

### Impossible Result
If constraints cannot all be satisfied (e.g. elements that cannot be hidden but do not physically fit in the available bounds), the resolver returns structured violations (`isValid: false` in validation, with a populated `violations` array) rather than silently violating them or creating overlapping geometry. The engine does NOT guarantee that arbitrary constraint combinations are solvable.

## Priority Strategy
Priority is represented by a number on `AdElementSpec` (e.g., 1 is highest priority). The engine sorts elements by priority and places them in order. High priority elements naturally get the most free space and their preferred anchoring positions. Low priority elements are placed later and are subjected to tight geometric spaces or forced into degraded states.

## Degradation Strategy
The degradation strategy is explicit and policy-driven (`DegradationPolicy`), not role-driven.
The `src/engine/degradation.ts` module generates a deterministic sequence of dimension states for an element:
1. `Original size` (preferred width/height)
2. `Resized` (scales down to 75%, then down to minimum allowed dimensions if permitted)
3. `Truncated` (if permitted, allows extremely compressed dimensions for text)
4. `Hidden` (the resolver handles hiding as a final fallback if permitted)

## Geometric Candidate Generation
Implemented in `src/engine/candidates.ts`.
Candidates are generated generically without hardcoded semantic rules. The generation priority is:
1. **Preferred soft anchor** (e.g., 'bottom-center' mapped to the usable area).
2. **Standard geometric edges/corners** (e.g., 'top-left', 'center', 'center-right').
3. **Generic Adjacency**: Points aligned above, below, left, or right of *already placed* elements.
4. **Grid Sweep Fallback**: A coarse sweep across the usable area to find fragmented pockets of space.

## Collision Detection
Implemented in `src/engine/collision.ts`.
A pure mathematical Axis-Aligned Bounding Box (AABB) intersection function (`rectanglesOverlap`). It correctly handles partial overlaps, complete containment, and ignores edges that are exactly touching.

## Bounds Validation
Implemented in `src/engine/bounds.ts`.
Every candidate is strictly validated to ensure it falls entirely within the `usableArea` of the surface, respecting safe-area margins on all 4 sides.

## Current Limitations
- **Text Measurement**: True browser-based font rendering text measurement is not implemented. Text dimensions are currently estimated purely by bounding box rules defined in the specification.
- **Complex Alignments**: Elements do not currently align their baselines or share grid tracks (e.g., flexbox or CSS grid); they are strictly absolutely positioned based on geometric free space.

## Testing Strategy
The automated test suite (`src/tests`) is built with Vitest to guarantee core invariants instead of asserting brittle implementation coordinates.

### Unit Tests
- **Collision (`collision.test.ts`)**: Proves that AABB mechanics correctly handle edges, partial overlaps, and complete containment.
- **Bounds (`bounds.test.ts`)**: Proves that the usable area calculation accounts for asymmetric safe areas, and `isWithinBounds` rejects geometries that cross the threshold.
- **Degradation (`degradation.test.ts`)**: Proves state transition logic. Guarantees that truncation and resizing NEVER bypass absolute hard minimums.
- **Validation (`validation.test.ts`)**: Proves the invariant checker accurately flags out-of-bounds, overlaps, and tap-target violations, and that hidden elements don't trigger false positives.

### Integration Tests (`resolver.test.ts`)
- **Integration & Invariants**: Uses a reusable `assertValidResolvedLayout` helper to prove that no overlapping or out-of-bounds elements ever leak through on successful layouts.
- **Surface Independence**: Proves that wildly different arbitrary dimensions (e.g. 1373x417) produce valid layouts without a single line of surface-specific code.
- **Determinism**: Proves that executing identical inputs produces identical outputs down to the decimal.
- **Failure Path**: Proves that physically impossible constraints accurately result in structured violations rather than returning overlapping or silent invalid geometry.
