# Adaptive Layout Engine for Multi-Surface Ads

## Assignment Overview

Build a layout engine that takes one declarative advertisement specification and adapts it across fundamentally different surfaces and constraints.

The engine must produce valid layouts without per-surface hardcoded layouts.

The core focus is:

* Constraint-based layout resolution
* Priority-based degradation
* Strong TypeScript typing
* Clean architecture
* Meaningfully different layouts across surfaces
* A convincing visual demonstration

The project should demonstrate systems thinking applied to adaptive layout rather than ordinary responsive CSS.

---

# 1. Core Requirements

## 1.1 Ad Specification

Define an advertisement's content and layout intent once, independently of the target surface.

The example advertisement must contain at minimum:

* Headline
* Product image
* Price
* CTA
* Branding
* Secondary text

The advertisement specification must not contain per-surface coordinates or hardcoded layouts.

Conceptually:

```ts
const adSpec = defineAd({
  id: "product-ad",
  elements: [
    // headline
    // image
    // price
    // CTA
    // branding
    // secondary text
  ]
});
```

The same `adSpec` must be passed to the resolver for every surface.

---

# 2. Surface Profiles

Surface profiles must describe real constraints rather than only width and height.

A surface may contain:

* Width
* Height
* Safe-area margins
* Minimum text size
* Minimum tap target
* Touch capability
* Viewing distance
* Other relevant constraints

Conceptually:

```ts
interface SurfaceProfile {
  width: number;
  height: number;

  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  minTextSize: number;
  minTapTarget?: number;

  touchEnabled?: boolean;
  viewingDistance?: number;
}
```

The implementation may extend this model where justified.

---

# 3. Constraint-Based Resolution

Given:

* One advertisement specification
* One surface profile

the engine must produce a valid resolved layout.

The resolver must:

* Respect hard constraints
* Respect element priorities
* Place elements within the visible surface
* Prevent overlaps
* Prevent clipping
* Adapt element size and position
* Recompose layouts for different aspect ratios
* Gracefully degrade lower-priority elements when space is insufficient

The resolver must be generic.

It must not contain a lookup table of predefined layouts.

---

# 4. Priority and Degradation

Every element should have a priority.

Example priority order:

1. CTA
2. Headline
3. Product image
4. Price
5. Branding
6. Secondary text

When space is insufficient:

* Higher-priority elements should be protected.
* Lower-priority elements should degrade first.

Possible degradation strategies include:

* Resize
* Reposition
* Reduce spacing
* Truncate
* Hide
* Remove optional elements

Example:

If the surface becomes too small:

```text
Secondary text
        ↓
Branding
        ↓
Price compression
```

may degrade before:

```text
Headline
CTA
```

The exact strategy should be deterministic and documented.

---

# 5. Hard Constraints

The engine should support constraints such as:

* Minimum text size
* Minimum CTA tap target
* Minimum element dimensions
* Maximum element dimensions
* Safe-area boundaries
* Surface boundaries

Hard constraints must not be silently violated.

If a valid layout cannot be produced, the engine should clearly report the constraint failure or degradation decision.

---

# 6. Layout Output

The resolver must return a strongly typed resolved layout.

Conceptually:

```ts
interface ResolvedElement {
  id: string;

  x: number;
  y: number;

  width: number;
  height: number;

  visible: boolean;

  priority: number;

  state:
    | "placed"
    | "repositioned"
    | "resized"
    | "truncated"
    | "hidden";

  reason?: string;
}
```

The renderer should consume this output directly.

The renderer should not independently decide layout positions.

---

# 7. Rendering

Render the resolved layout to actual DOM/CSS or Canvas.

The project must visibly demonstrate the same advertisement specification resolving into different layouts.

At least four surfaces are required:

1. Mobile Portrait
2. Mobile Landscape
3. Broadcast Lower Third
4. Square Kiosk

The layouts must be meaningfully different.

Uniform scaling is not sufficient.

---

# 8. Required Demo

Build a demo application where the user can:

* View the advertisement
* Switch between surface profiles
* See the layout re-resolve
* Observe different element arrangements
* Demonstrate priority-based degradation

At least one surface must intentionally provide insufficient space so that lower-priority content degrades or disappears instead of overlapping or clipping.

---

# 9. Type Safety

Element definitions, surface profiles, and resolved layouts should be strongly typed.

Invalid or inconsistent specifications should either:

* Produce TypeScript compile-time errors where practical
* Or produce clear runtime validation errors

Use TypeScript generics and inference where they genuinely improve the API.

Do not add unnecessary type complexity merely to appear advanced.

---

# 10. Architecture

Maintain a clean separation between:

```text
Ad Specification
       ↓
Validation
       ↓
Constraint Resolution
       ↓
Layout Output
       ↓
Renderer
```

The resolution engine should be framework independent.

A new surface profile should be addable without modifying the resolver algorithm.

A future renderer should be able to consume the same resolved layout.

---

# 11. Recommended Resolution Flow

A reasonable implementation may follow:

```text
Input Ad Specification
        ↓
Normalize Elements
        ↓
Validate Specification
        ↓
Read Surface Constraints
        ↓
Generate Placement Candidates
        ↓
Place Elements by Priority
        ↓
Validate Constraints
        ↓
Detect Collisions
        ↓
Apply Degradation
        ↓
Reposition / Resize
        ↓
Final Validation
        ↓
Resolved Layout
```

This is guidance rather than a mandatory implementation.

The final algorithm must be deterministic, explainable, and testable.

---

# 12. Documentation Requirements

## README.md

Must include:

* Project overview
* Setup instructions
* How to run the application
* How to switch surfaces
* How the layout engine works
* Known limitations
* Time spent
* AI tool disclosure
* Deployment URL if deployed

## ARCHITECTURE.md

Must explain:

* System architecture
* Layout algorithm
* Constraint resolution
* Priority/degradation strategy
* TypeScript design
* Collision handling
* Validation
* Rendering architecture
* How a new surface can be added
* How the system could support another renderer

---

# 13. Evaluation Criteria

## Constraint Resolution Algorithm — 35%

Evaluate:

* Genuine constraint resolution
* Generic algorithm
* Priority handling
* Graceful degradation
* No surface-specific hardcoding

## Layout Correctness — 25%

Evaluate:

* No overlaps
* No clipping
* Correct constraints
* Meaningfully different layouts
* Correct adaptation across surfaces

## TypeScript and Architecture — 20%

Evaluate:

* Strong typing
* Clean module boundaries
* Maintainability
* Framework-independent engine

## Example Application — 10%

Evaluate:

* Quality of the demonstration
* Realistic advertisement
* Ease of understanding the adaptation

## Code Quality — 10%

Evaluate:

* Readability
* Organization
* Documentation
* Logical implementation

---

# 14. Explicitly Disallowed Approaches

Do NOT implement:

```ts
if (surface === "mobile") {
  return mobileLayout;
}

if (surface === "broadcast") {
  return broadcastLayout;
}
```

Do NOT create per-surface coordinate tables.

Do NOT use CSS media queries as the actual layout-resolution algorithm.

Do NOT rely on uniform scaling.

Do NOT hide overlapping or clipping problems through CSS.

The TypeScript resolver must make the layout decisions.

---

# 15. Optional Bonus Features

Only implement these after the core requirements are stable:

* Unknown/custom surface resolution
* Queryable resolution trace
* Relationship-like element grouping if useful
* Smooth surface transitions
* Text-measurement-aware layout
* Canvas renderer
* Accessibility-aware constraints
* Safe-area handling
* Layout export

Bonus features must never compromise the core resolver.

---

# 16. Live Interview Expectations

The developer should be able to:

1. Demonstrate the same ad resolving across all required surfaces.
2. Explain the resolution algorithm step by step.
3. Explain why each element received its position and size.
4. Explain priority and degradation.
5. Introduce a new surface profile.
6. Resolve the new surface without modifying the resolver.
7. Explain TypeScript design decisions.
8. Explain how the architecture could support future renderers.
9. Discuss limitations and possible improvements.

The implementation must therefore prioritize explainability over unnecessary complexity.

---

# 17. Final Principle

A small, genuinely working, explainable constraint-resolution engine is more valuable than a large feature set built on hardcoded layouts.

The same specification must be able to adapt to new constraints without changing the engine's surface-specific logic.
