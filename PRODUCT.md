# Product

## Register

product

## Users

**Primary A — Fleet operators (global):** Owner or general manager of a small taxi, ride-hail, or mixed fleet (roughly 5–40 vehicles), anywhere in the world. They run the business, not only drive. They open Autiqa at a desk or laptop during the day shift, often between phone calls and yard checks.

**Job to be done:** See fleet health, compliance risk, and money in one place without reconciling spreadsheets. Catch insurance, inspection, and installment deadlines before they stop revenue. Understand per-vehicle economics well enough to decide what to keep, sell, or assign.

**Primary B — Short-term rental operators (tourist-facing):** Owner or manager of a small car rental business serving tourists — at a resort, coastal destination, airport, or city centre. 5–30 vehicles. Their business runs on utilization rate, availability windows, and daily revenue. They deal with seasonal demand spikes, rotating customers (not recurring drivers), and per-rental insurance exposure.

**Job to be done:** Know which cars are available and which are out, track per-rental revenue and costs, stay on top of vehicle compliance between rental cycles. Turn around vehicles fast; catch damage and insurance gaps before the next handover.

**Shared context:** Both segments outgrew spreadsheets. Thin margins, low tolerance for tools that require setup consultants. Local language and local currency are table-stakes trust, not localisation polish.

## Product Purpose

Autiqa is a **fleet control center**: vehicles, drivers, finance, and compliance timelines in one workspace for operators who outgrew Excel — whether they're running a taxi fleet or a tourist car rental business.

**Success looks like:** For fleet operators: fewer missed formal deadlines, faster answers to "what is this car costing us?", one narrative linking operations to P/L. For rental operators: real-time availability visibility, per-rental revenue tracking, and compliance that doesn't fall through the cracks between bookings. Activation in both cases means onboarding real vehicles with at least one active workflow, not just creating an account.

**Co-primary surfaces:** The authenticated app (`/app`) and the marketing landing (`/`) are equally important to the business. Default impeccable register is `product` for ambiguous tasks; **override to `brand`** when editing landing, campaigns, or public marketing copy.

## Brand Personality

**Three words:** Precise · trusted · clear

**References:** Stripe, Mercury — financial precision, restrained but warm, trustworthy density, confident type scale, generous whitespace. Feels like a professional instrument, not a productivity poster.

**Voice:** Matter-of-fact. Short sentences. Numbers and dates when they change decisions. No filler copy. Every market's copy should sound like a peer who runs fleets — a trusted advisor, not a SaaS brochure. English is the default; local-language copies follow the same register, not a translation layer. Landing should sell by showing the product, not by claiming superlatives.

**Emotional goal:** Confidence and clarity — "I see what's happening and I know what to do," not "another dashboard to manage."

## Anti-references

- **The old Autiqa v1:** Electric-blue gradient CTAs, committed-accent-on-everything, AI-generated layouts, cramped modals. Looked like tool slop, not a product someone chose.
- **Generic B2B SaaS:** Centered hero, three identical icon cards, stock "platform" language, safe blue-grey nothingness.
- **Spreadsheet cosplay:** Grey grid lines, export-first workflows, stale snapshot KPIs.
- **Consumer ride-hail:** Passenger maps, playful illustration, neon nightlife palette.
- **Editorial magazine landing:** Display serif drama, ruled columns, typographic lane without product proof.

## Design Principles

1. **One operating picture** — Operations, compliance, and finance must read as the same fleet story, not three modules — whether the operator runs taxis or rents cars to tourists.
2. **Risk before revenue loss** — Surfaces that prevent grounded cars, missed renewals, and between-rental compliance gaps outrank vanity metrics.
3. **Sell with the product, not about it** — Landing earns trust by showing real fleet data, timelines, and compliance records — not abstract diagrams or superlative copy.
4. **Precision over decoration** — Every color, weight, and spacing decision should carry information or guide attention. Nothing decorative that doesn't earn its place.
5. **Locale-first trust** — Local language, local currency, and local regulatory vocabulary (inspections, policies, installments, rental agreements) are product requirements, not i18n polish. The product ships to any market; it should feel native in each one.

## Accessibility & Inclusion

**Target:** Pragmatic accessibility — fix blockers (keyboard, focus, labels, contrast on new work) without claiming a formal audit yet.

**Expectations:** Respect `prefers-reduced-motion`. Meaningful `aria` on nav, pricing controls, and locale/currency switchers. Skip link on marketing. Expand toward WCAG 2.1 AA as the app hardens.

**Known considerations:** Small business users on mid-range phones and older desktops across varied markets; avoid relying on color alone for compliance severity (pair with icon or label). RTL and non-Latin script support may become relevant as the market expands.
