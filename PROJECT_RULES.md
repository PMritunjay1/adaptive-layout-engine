# PROJECT RULES — ADAPTIVE LAYOUT STUDIO

These rules govern the implementation of the Adaptive Layout Studio.

The goal is to produce a technically strong, visually impressive, interview-explainable submission.

---

# 1. PRIMARY OBJECTIVE

Build a genuine constraint-based layout engine first.

Build the visual studio around the engine second.

Do not optimize for number of files, number of components, or amount of code.

Optimize for:

1. Correctness
2. Generic resolution logic
3. Explainability
4. Type safety
5. Architecture
6. Visual quality
7. Feature richness
8. Polish

Never sacrifice a higher-priority item for a lower-priority one.

---

# 2. ABSOLUTE RULE: NO SURFACE-SPECIFIC RESOLVER LOGIC

The resolver must NEVER contain logic such as:

```ts
if (surface === "mobile") ...
if (surface === "broadcast") ...
if (surface === "kiosk") ...
```

Do not use:

* Surface-name switches
* Surface-specific coordinate tables
* Surface-specific layout functions
* Hidden breakpoint logic
* Hardcoded layouts disguised as algorithms

The resolver must reason from generic constraints.

A new surface profile must be usable without modifying the resolver algorithm.

This is a core architectural requirement.

---

# 3. ENGINE / UI SEPARATION

The layout engine must not depend on React.

The engine should be plain TypeScript.

Recommended separation:

```text
Domain Models
      ↓
Layout Engine
      ↓
Resolved Layout
      ↓
Renderer
      ↓
React UI
```

React should control:

* panels
* controls
* state
* user interaction
* visualization

React should NOT determine:

* element coordinates
* layout arrangement
* priority decisions
* degradation decisions
* collision resolution

Those decisions belong to the engine.

---

# 4. TYPE SAFETY

Use TypeScript deliberately.

Important domain concepts should have explicit types.

Prefer:

```ts
type ElementRole = ...
type Priority = ...
type Constraint = ...
type SurfaceProfile = ...
type ResolvedElement = ...
```

Use generics and inference where they make the developer API safer.

Do not create complicated generic types merely to look sophisticated.

The interviewer must be able to understand the type system.

---

# 5. DETERMINISTIC RESOLUTION

Given the same:

```text
adSpec + surfaceProfile
```

the resolver should produce the same result.

Avoid:

* random positioning
* non-deterministic ordering
* browser-dependent layout decisions where avoidable
* hidden global state

Determinism is important for:

* testing
* debugging
* live explanation
* reproducibility

---

# 6. PRIORITY SYSTEM

Every layout element must have an explicit priority or equivalent importance level.

Higher-priority elements must receive stronger protection.

When space becomes insufficient:

1. Reduce unnecessary spacing
2. Resize flexible elements
3. Reposition elements
4. Truncate optional content
5. Hide/remove low-priority elements

Do not destroy high-priority content while low-priority content could still be degraded.

The degradation order must be explainable.

---

# 7. HARD CONSTRAINTS

Hard constraints must be respected.

Examples:

* Surface boundaries
* Safe area
* Minimum text size
* Minimum CTA tap target
* Minimum element dimensions

Never silently violate a hard constraint.

If the engine cannot satisfy all constraints, return meaningful diagnostic information.

---

# 8. COLLISION SAFETY

A final layout must never intentionally contain overlapping visible elements.

Create reusable validation logic.

At minimum support:

```ts
detectOverlaps(...)
validateBounds(...)
validateConstraints(...)
```

The UI should be able to show whether the layout is valid.

---

# 9. RESOLUTION TRACE

The engine should expose enough information for the UI to explain important decisions.

Example:

```text
CTA
→ placed
→ protected because priority = 1

Headline
→ placed
→ resized to satisfy available height

Branding
→ reduced
→ low priority

Secondary Text
→ hidden
→ insufficient remaining space
```

This information should be generated from actual engine decisions.

Do not fake diagnostic messages.

---

# 10. TESTING BEFORE POLISH

The resolver must have automated tests before significant visual polish is added.

Test:

* normal surfaces
* extreme aspect ratios
* very small surfaces
* safe areas
* minimum text size
* minimum tap targets
* collisions
* bounds
* degradation
* hidden elements
* custom surfaces
* arbitrary dimensions

Prefer invariant-based tests.

Important invariants:

```text
No visible element overlaps another visible element.

No visible element leaves the valid surface region.

Hard constraints are not silently violated.

Higher-priority elements are protected from lower-priority degradation.

A new surface does not require resolver source changes.
```

---

# 11. ARCHITECTURAL SIMPLICITY

Avoid unnecessary:

* service layers
* repositories
* factories
* dependency injection containers
* state management libraries
* design patterns without a concrete need

A small system with obvious boundaries is preferable to an enterprise-style architecture for a small assignment.

Every abstraction must have a reason.

---

# 12. VISUAL QUALITY

The application is also a product demonstration.

The UI should look polished enough that a reviewer immediately understands the value of the engine.

Target:

* professional visual hierarchy
* clean spacing
* consistent typography
* strong preview area
* clear panels
* polished controls
* useful micro-interactions
* responsive behavior
* meaningful empty/loading/error states

Avoid visual clutter.

The interface should feel like an engineering/design tool.

---

# 13. FEATURE PRIORITY

Features must be implemented in this order.

## P0 — Selection Critical

These are mandatory:

* Generic resolver
* Type-safe models
* Four required surfaces
* Priority system
* Degradation
* Collision prevention
* Bounds validation
* Hard constraints
* Automated tests
* DOM rendering
* Clean architecture

## P1 — Strong Differentiators

Implement after P0:

* Custom surface creator
* Unknown surface demo
* Resolution trace
* Constraint inspector
* Priority inspector
* Debug overlays
* Safe-area visualization
* Stress testing
* Interactive specification controls

## P2 — Product Polish

Only after P0 and P1:

* Animations
* Theme switching
* Keyboard shortcuts
* Toast notifications
* Responsive workspace
* polished transitions
* accessibility improvements

## P3 — Optional

Only if time remains:

* Canvas renderer
* Export
* Advanced text measurement
* Additional element types
* Saved configurations

Never work on P2/P3 while P0 is incomplete.

---

# 14. UNKNOWN SURFACE REQUIREMENT

The application should eventually demonstrate that the resolver does not depend on known surface names.

Provide a custom/unknown surface UI.

Example:

```text
Width: 1440
Height: 420
Safe Area: 32
Minimum Text Size: 28
Touch: false
```

The user should be able to click:

```text
RESOLVE
```

and see the same advertisement adapt.

No resolver code should change.

This is an important live-interview demonstration.

---

# 15. STRESS TEST

Eventually implement a controlled stress test.

The user should be able to reduce:

* width
* height

and observe degradation.

Show:

```text
Placed
↓
Resized
↓
Repositioned
↓
Truncated
↓
Hidden
```

The purpose is to visually demonstrate the engine's degradation strategy.

Do not create fake stress-test numbers.

---

# 16. NO FAKE METRICS

Never display fabricated:

```text
99 FPS
0ms latency
100% success
Perfect score
```

unless the application actually measures those values.

If metrics are shown, derive them from real measurements.

---

# 17. NO FAKE FEATURES

Do not create buttons that do nothing.

Do not create:

* fake exports
* fake saving
* fake analytics
* fake performance metrics
* fake resolution results

A smaller working feature is better than a larger fake feature.

---

# 18. ERROR HANDLING

The application should gracefully handle:

* invalid dimensions
* impossible constraints
* missing required content
* invalid values
* extremely small surfaces
* failed rendering
* invalid specifications

Errors should be visible and understandable.

Never silently fail.

---

# 19. CODE STYLE

Prefer:

* pure functions
* descriptive names
* small functions
* explicit return types for important APIs
* immutable data where practical
* clear domain models
* comments explaining WHY

Avoid:

* giant files
* giant functions
* magic numbers
* deeply nested conditions
* duplicated logic
* unexplained constants
* clever code that is difficult to explain

---

# 20. DOCUMENTATION

Keep documentation synchronized with implementation.

README must eventually include:

* setup
* usage
* architecture overview
* supported surfaces
* demo instructions
* limitations
* AI usage disclosure
* time spent
* deployment URL

ARCHITECTURE.md must explain:

* resolver pipeline
* constraint model
* placement strategy
* priority strategy
* degradation
* collision handling
* validation
* renderer separation
* extensibility

Do not write documentation that claims functionality that does not exist.

---

# 21. DEVELOPMENT PROCESS

Work incrementally.

Use these phases:

```text
Phase 1
Architecture + types

Phase 2
Core resolver

Phase 3
Automated tests

Phase 4
DOM renderer

Phase 5
Studio UI

Phase 6
Inspector + debug tools

Phase 7
Custom/unknown surface

Phase 8
Stress testing

Phase 9
Visual polish

Phase 10
Deployment + documentation

Phase 11
Interview audit
```

Do not skip directly to Phase 9.

---

# 22. AFTER EACH PHASE

Before proceeding:

1. Run the application.
2. Run TypeScript checks.
3. Run tests.
4. Check for runtime errors.
5. Review architecture.
6. Confirm the phase requirements.
7. Remove unnecessary complexity.

If something is broken, fix it before adding features.

---

# 23. ANTIGRAVITY BEHAVIOR

Do not implement the whole project in one response.

Do not silently make major architectural decisions without explaining them.

When a design choice materially affects the engine, explain:

* the decision
* alternatives considered
* why this approach fits the assignment
* how it affects the live interview

Do not add libraries unless they provide a clear benefit.

Before adding a dependency, consider whether the same result can be achieved with the existing stack.

---

# 24. INTERVIEW-FIRST ENGINEERING

Every important implementation should be explainable by the developer.

The developer should be able to answer:

### Why?

Why does this abstraction exist?

### How?

How does the resolver make decisions?

### What happens when?

What happens when constraints conflict?

### What if?

What happens with an unknown surface?

### How does it scale?

How would the algorithm evolve for:

* more element types
* more constraints
* text measurement
* accessibility
* broadcast safe areas
* print bleed
* Canvas rendering

Do not implement something solely because it looks impressive if it cannot be explained.

---

# 25. SELECTION STRATEGY

The final project should communicate three things immediately:

## 1. Engineering depth

The reviewer should see a real constraint-resolution system.

## 2. Product quality

The reviewer should see a polished and thoughtfully designed application.

## 3. Developer maturity

The reviewer should see clear tradeoffs, limitations, tests, documentation, and architecture.

The project should never look like:

```text
pretty UI + shallow algorithm
```

It should look like:

```text
strong algorithm
+
strong architecture
+
excellent visualization
```

---

# 26. DEFINITION OF DONE

The project is not done until:

* Core resolver works
* Four required surfaces work
* Same ad spec is reused
* Layouts meaningfully differ
* Priority degradation works
* Hard constraints are handled
* No visible overlaps exist
* No visible clipping exists
* Custom surface works
* Tests pass
* TypeScript passes
* Production build succeeds
* UI is polished
* Error states work
* README is complete
* ARCHITECTURE.md is complete
* AI usage is disclosed
* Deployment works if deployed
* Developer can explain the important code during a live interview
* Developer can add a new surface without modifying surface-specific resolver logic

---

# FINAL RULE

When forced to choose between:

```text
more features
```

and

```text
correct core behavior
```

choose:

```text
correct core behavior
```

When the core is stable, use the remaining time to increase visual quality and demonstration depth.

The objective is not to build the largest project.

The objective is to build the project that makes the reviewer believe:

**"This candidate understands the problem, built a real solution, and can explain it."**
