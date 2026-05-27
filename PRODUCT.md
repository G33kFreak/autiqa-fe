# Product

## Register

product

## Users

**Primary:** Owner or general manager of a small taxi, rental, or mixed fleet in Poland (roughly 5–40 vehicles). They run the business, not only drive. They open Autiqa during the day shift at a desk or laptop in a small office, often between phone calls and yard checks.

**Job to be done:** See fleet health, compliance risk, and money in one place without reconciling spreadsheets. Catch insurance, inspection, and installment deadlines before they stop revenue. Understand per-vehicle economics well enough to decide what to keep, sell, or assign.

**Context:** Thin margins, high churn of drivers and vehicles, low tolerance for another “tool” that needs a consultant. Polish-first language and PLN pricing are part of trust, not an afterthought.

## Product Purpose

Autiqa is a **fleet control center**: vehicles, drivers, finance, and compliance timelines in one workspace for operators who outgrew Excel.

**Success looks like:** Fewer missed formal deadlines, faster answers to “what is this car costing us?”, and one narrative linking operations to P/L. Activation means onboarding a real fleet (vehicles + at least one compliance or finance workflow), not just creating an account.

**Co-primary surfaces:** The authenticated app (`/app`) and the marketing landing (`/`) are equally important to the business. Default impeccable register is `product` for ambiguous tasks; **override to `brand`** when editing landing, campaigns, or public marketing copy.

## Brand Personality

**Three words:** Bold · electric · urgent

**Voice:** Confident operator energy, not corporate filler. Short sentences. Numbers and dates when they change decisions. PL copy should sound like a peer who runs fleets, not a translation layer.

**Emotional goal:** Momentum and control — “we see risk early and act,” not “another dashboard.”

**References (feel, not copy):** High-performance ops tools with strong hierarchy and committed accent color; editorial restraint on data density inside the app. Landing may be more expressive; app stays scannable.

## Anti-references

- **Generic B2B SaaS:** Centered hero, three identical icon cards, stock “platform” language, safe blue-grey nothingness.
- **Spreadsheet cosplay:** Grey grid lines, export-first workflows, stale snapshot KPIs.
- **Editorial magazine landing:** Display serif drama, ruled columns, typographic lane without product proof.
- **Consumer ride-hail:** Passenger maps, playful illustration, neon nightlife palette.

## Design Principles

1. **One operating picture** — Operations, compliance, and finance must read as the same fleet story, not three modules.
2. **Risk before revenue loss** — Surfaces that prevent grounded cars and missed renewals outrank vanity metrics.
3. **Bold where it sells, calm where it works** — Landing can carry electric accent and motion; app prioritizes scan speed and trustworthy density.
4. **Poland-first trust** — PL default, PLN pricing, and local formal vocabulary (inspections, policies, installments) are product requirements, not i18n polish.
5. **Show the system, not the slide deck** — Prefer product-shaped visuals (alerts, timelines, fleet records) over abstract diagrams on marketing pages.

## Accessibility & Inclusion

**Target:** Pragmatic accessibility — fix blockers (keyboard, focus, labels, contrast on new work) without claiming a formal audit yet.

**Expectations:** Respect `prefers-reduced-motion` (landing already does). Meaningful `aria` on nav, pricing slider, and locale switcher. Skip link on marketing. Expand toward WCAG 2.1 AA as the app hardens.

**Known considerations:** Small business users on mid-range phones and older desktops; avoid relying on color alone for compliance severity (pair with icon or label).
