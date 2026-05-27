---
name: Autiqa
description: Tactical Intelligence — fleet control center for taxi and rental operators
colors:
  surface: "#f7f9fb"
  surface-container-low: "#f2f4f6"
  surface-container: "#eceef0"
  surface-container-high: "#e6e8ea"
  surface-container-highest: "#e0e3e5"
  surface-container-lowest: "#ffffff"
  on-surface: "#191c1e"
  on-surface-variant: "#45464d"
  secondary: "#0050cc"
  secondary-container: "#0266ff"
  secondary-fixed: "#dae1ff"
  error: "#ba1a1a"
  success: "#059669"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  subtle: "0.375rem"
  md: "0.5rem"
  xl: "0.75rem"
  full: "999px"
spacing:
  section: "4rem"
  block: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "0.5rem 1.25rem"
  button-secondary:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "0.5rem 1.25rem"
---

## Overview

Autiqa is a **Tactical Intelligence** product: a fleet control center for taxi, rental, and mixed operators who outgrew spreadsheets. The creative north star is **The Kinetic Architect** — logistics as a living operation, not a static ledger. Marketing surfaces (landing) use the **brand** register: committed electric blue on cool neutrals, editorial Manrope headlines, asymmetric hero layouts. The authenticated app uses the same token set with higher data density.

**Scene sentence (theme):** A fleet manager reviews vehicles, compliance, and P/L at a bright desk during the day shift in a small office — light surfaces reduce glare and match operational paperwork nearby.

## Colors

**Strategy:** Committed accent (~30% of focal areas) on restrained cool neutrals. Primary brand motion is `secondary` (#0050CC) → `secondary-container` (#0266FF) at 135° on CTAs only — not on body text.

**Surface hierarchy (no 1px section borders):**
1. Canvas: `surface` (#f7f9fb)
2. Sections: `surface-container-low`
3. Hover / nested: `surface-container` → `surface-container-highest`
4. Elevated cards: `surface-container-lowest` on lower surfaces

**Functional:** `error` for risk alerts; `#059669` (success) for compliance-positive strips on marketing cards.

**Bans:** Pure #000 / #fff; opaque grey dividers; gradient clipped text; decorative glass on every card.

## Typography

- **Display (Manrope):** Headlines, KPIs, pricing amounts. Scale with `clamp()`; ratio ≥1.25 between steps.
- **Body (Inter):** UI copy, tables, forms. Default 0.875rem; labels at 0.6875rem uppercase with 0.05–0.12em tracking where used sparingly.
- **Line length:** Marketing body max ~65–75ch; app leads ~40rem.

## Elevation

Depth via **tonal layering**, not borders. Ambient shadow for floats: `0 12px 32px rgba(25, 28, 30, 0.06)`. Glass overlays (nav, mobile menu): `secondary-container` at ~80% + `backdrop-filter: blur(12px)` — rare, purposeful.

Section headings on landing use a **short accent bar** (`::before` rule), not left border stripes on cards.

## Components

| Primitive | Treatment |
|-----------|-------------|
| Primary button | Gradient fill secondary → secondary-container, white text, xl radius |
| Secondary button | `surface-container-high`, no border |
| Ghost / link | `on-surface` or `secondary` text |
| Inputs | `surface-container-highest`, md radius, 2px secondary glow on focus |
| Fleet / status chip | Pill, `secondary-fixed` background |
| Logo mark | Rounded square electric-blue tile (CSS fill, not SVG var gradients) + white “A” with radar arc |

Landing styles live in `app/assets/css/landing.css`; section components under `app/components/landing/`. Logo: `app/components/AutiqaLogo.vue` (root `components/` so Nuxt auto-imports as `AutiqaLogo`).

## Do's and Don'ts

**Do**
- Use `surface-container-*` steps to separate regions
- Right-align data visuals in asymmetric layouts where it aids scan
- Prefer `manrope` for numbers and headlines above 24px
- Keep one strong kicker per section, not repeated uppercase scaffolding

**Don't**
- Side-stripe borders on cards or lists (use tint blocks or icons)
- Gradient text for emphasis
- Identical icon + title + blurb card grids without narrative
- Default to dark mode “because SaaS”; light matches the operational scene above
