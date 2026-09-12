# Adaptive Layout Studio

Adaptive Layout Studio is a demonstration of a constraint-based layout resolution engine for multi-surface advertisements. 

This project proves a central engineering thesis: **One Declarative Ad Spec + One Generic Resolution Engine = Valid Compositions across any Surface**, without relying on surface-specific CSS media queries or hardcoded framework branching.

## Project Overview

The core of this project is a genuinely generic, explainable, constraint-based layout resolution engine. It takes a single, declarative advertisement specification and an arbitrary surface constraint profile, and produces a valid resolved layout containing position, dimensions, visibility, and degradation decisions for every element.

The layout resolution is strictly decoupled from the UI framework (React) and operates on pure TypeScript models. The UI simply renders the final computed coordinates and dimensions.

## Features

### Studio Mode
An interactive, professional layout-engineering workstation.
- Inspect the resulting layout on predefined surfaces (Mobile Portrait, Mobile Landscape, Broadcast Lower-Third, Square Kiosk).
- Interactively test custom constraint profiles via the "Unknown Surface" generator.
- Toggle the Safe Area bounds (Constraint Overlay) to verify the engine respects physical limitations.
- Run the "Constraint Stress Test" to instantly force degradation and verify the engine's prioritization logic.

### Compare Mode
A 4-up artboard grid that independently resolves the exact same `AdSpec` across the four required surfaces. This proves the core thesis: one declarative spec automatically produces multiple valid layouts purely based on mathematical constraints.

### Engine Inspector & Transparency
Select any element on the canvas to view its engine execution trace in the Inspector panel. The Inspector exposes:
- Target vs. Resolved dimensions and positions.
- The element's exact degradation policies (Resize, Truncate, Hide).
- A human-readable interpretation of the decision context.
- The raw, line-by-line resolution trace for deep engineering verification.

## Architecture Pipeline

The resolution engine (`src/engine/resolver.ts`) follows a deterministic pipeline to map an Ad Specification onto a target Surface:

1. **Validation**: Enforce base limits (e.g., minimum surface sizes) before attempting layout.
2. **Degradation State Generation**: Pre-calculate valid fallback states (resizing, truncating, hiding) for all elements based on their policies.
3. **Priority Sorting**: Process elements strictly in order of their specified importance.
4. **Candidate Generation**: Scan the available coordinate grid to propose potential placement rectangles.
5. **Bounds & Collision Checking**: Mathematically ensure the candidate stays within the Safe Area and does not overlap higher-priority elements.
6. **State Fallback**: If all candidates fail for an element's preferred state, degrade the element to its next permitted state and retry.

## Setup & Running

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Run the invariant test suite:
```bash
npm run test
```
*Note: The engine is backed by a 39-test invariant suite (Vitest) mathematically proving layout integrity across collisions, degradation policies, and constraint boundaries.*

## Technical Identity
The application UI utilizes an "Industrial Editorial / Precision Studio" aesthetic. It strictly avoids generic AI dashboard tropes, favoring a warm graphite palette, monospace technical metadata, sharp geometry, and structural clarity to emphasize its role as a debugging and engineering tool.
