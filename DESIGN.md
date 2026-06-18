<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Autiqa
description: Fleet control center for Polish taxi and rental operators — financial precision, operational clarity
---

# Design System: Autiqa

## 1. Overview

**Creative North Star: "The Fleet Manifest"**

Autiqa looks like a well-designed financial report, not a startup dashboard. The reference pair — Stripe and Mercury — both earn trust through restraint: near-white surfaces, constrained palette, serif/sans contrast, and color that appears only when it signals something meaningful. Autiqa applies this logic to fleet operations: compliance deadlines, vehicle economics, and driver assignments rendered with the same typographic clarity as a quarterly P&L.

The visual language is warm authority. A display serif (Lora or Instrument Serif) gives section headers and prominent numerics the editorial weight of a professional document. Inter keeps data tables and form controls crisp and neutral. The brand hue is deep ocean navy — not the electric blue of generic SaaS, but something closer to a maritime chart: authoritative, directional, trusted. It appears on primary CTAs, active states, and a small number of semantic anchors. It does not appear on every surface.

The second "accent" is functional, not decorative: error red for risk and compliance failures, success green for clean compliance. These are semantic roles, not brand expressions. They earn their color by carrying information the operator must act on.

**What this system explicitly rejects:**
- The old Autiqa v1: gradient blue CTAs, tonal accent-on-everything, cramped modals that look AI-generated
- Generic B2B SaaS: identical icon-card grids, stock "platform" language, safe blue-grey neutrals
- Consumer ride-hail: playful illustration, neon palette, passenger-facing metaphors
- Editorial magazine landing: display-serif drama with no product proof

**Key Characteristics:**
- Near-white cool surfaces that read clean under office/desk daylight
- Display serif + humanist sans: editorial authority at headlines, precision at data
- Deep navy as the one primary accent, used on ≤10% of any screen
- Semantic color only: risk red and compliance green carry information, never decoration
- Whitespace is structural, not padding — spacing conveys hierarchy, not just breathing room
- No decorative borders, gradients, or glassmorphism; elevation through tonal steps

## 2. Colors

The palette is near-monochrome with two earned accent roles: one brand (navy), two semantic (risk/compliance).

**The Rarity Rule.** The primary navy is used on ≤10% of any given screen. Its scarcity signals authority. Overusing it turns it into wallpaper.

**The Semantic-Only Rule.** Error red and success green appear only when they carry information that changes the operator's next action. Never as decoration, illustration, or emphasis.

### Primary
- **Deep Fleet Navy** (`[to be resolved during implementation]`, direction: deep ocean blue, OKLCH L ~30–38%, C ~0.10–0.15, H ~240–255): Primary CTAs, active navigation states, interactive focus rings, primary headings on landing. Rich and authoritative — not the electric blue of SaaS, not the corporate navy of enterprise. Think the color of a nautical chart's deepest water.

### Secondary (Semantic)
- **Risk Red** (`[to be resolved]`, direction: OKLCH L ~40–45%, C ~0.18, H ~25–30): Compliance failures, overdue inspections, grounding risk. Error states only.
- **Compliance Green** (`[to be resolved]`, direction: OKLCH L ~42–48%, C ~0.14, H ~155–165): Clean compliance, positive financial indicators, active/valid status. Success states only.

### Neutral
- **Surface** (`[to be resolved]`, direction: near-white with very slight cool tint, OKLCH L ~97–98%, C ~0.003–0.006, H ~230–250): Page canvas and default card background. Not warm, not pure white — a cool precision.
- **Container Low** (direction: subtle elevation step above surface): Sections, card backgrounds on a canvas surface.
- **Container** (direction: mid-step): Hover states, table headers, form field backgrounds.
- **Outline** (direction: OKLCH L ~70%, near-zero chroma): Dividers and field strokes. Kept light; structural lines should not compete with data.
- **Ink** (direction: OKLCH L ~15–20%, C ~0.02, H ~240): Primary text. Near-black, slightly cool to harmonize with navy.
- **Ink Muted** (direction: OKLCH L ~45–50%): Secondary copy, labels, metadata. Must pass 4.5:1 against Surface — never pure gray.

## 3. Typography

**Display Font:** Lora (or Instrument Serif) with Georgia, serif fallback
**Body Font:** Inter with system-ui, sans-serif fallback

**Character:** The contrast axis is authority vs. precision. Lora carries the weight of a field report — confident at display sizes, never decorative. Inter makes tabular data effortless — no personality at data scale, which is exactly right. Together: a professional who knows the numbers and writes them clearly.

### Hierarchy
- **Display** (700, `clamp(2rem, 5vw, 3.5rem)`, 1.08, LS −0.03em): Hero headlines and landing section headers. Lora only. Never in the authenticated app at this scale.
- **Headline** (600, `clamp(1.5rem, 3vw, 2rem)`, 1.12, LS −0.025em): Major page titles (fleet summary, finance overview). Lora. Max 1 per page in the app.
- **Title** (700, `1.125rem`, 1.2, LS −0.015em): Section headers, card titles, dialog headings. Inter. The weight carries the hierarchy.
- **Body** (450–500, `0.9375rem`, 1.55): Primary reading copy — form labels, descriptions, table cell content. Inter. Max line length 65ch in marketing, ~40rem in app.
- **Data** (500, `0.875rem`, 1.4): Numbers, dates, plate numbers, amounts. Inter. Tabular figures (`font-variant-numeric: tabular-nums`). Mandatory in all financial tables.
- **Label** (700, `0.6875rem`, 1.2, LS 0.06em, uppercase): Column headers, kicker labels, status chip text. Inter. Used sparingly — one dominant label per section, not repeated scaffolding.

**The One Serif Rule.** Lora appears only at Headline and Display levels. No Lora at body copy, table cells, or UI labels. Below 1.125rem, Inter only.

**The Tabular Rule.** Any column that contains currency, distances, counts, or dates must use `font-variant-numeric: tabular-nums`. Misaligned numbers in tables is a trust failure for operators reading financial reports.

## 4. Elevation

Flat by default. Depth is conveyed through tonal surface steps, not shadows. The canvas is the lightest surface; cards and sections step slightly toward Container; interactive controls step toward Container High on hover. This matches the Stripe/Mercury model: clean planes, no decorative depth.

**The No-Decorative-Shadow Rule.** Shadows appear only on floated elements: modals, dropdowns, toasts, sticky nav. Never on static cards or section containers. If a card is casting a shadow, it should be floating.

### Shadow Vocabulary
- **Float** (`0 8px 28px rgba(15, 20, 35, 0.10), 0 2px 6px rgba(15, 20, 35, 0.06)`): Modals, dropdown menus, command palettes. Appears on elevation, not on hover.
- **Hover glow** (`0 4px 16px rgba([navy] 0.12)`): Optional on primary CTA buttons only. Not on cards, not on data surfaces.

## 5. Components

*Seed mode: specific component styles will be defined during implementation. Guidelines below establish the character for each primitive.*

### Buttons
- **Shape:** Slightly rounded, not pill — `0.5rem` (8px) radius. Stripe-like: purposeful, not playful.
- **Primary:** Deep navy background, white text, `0.625rem 1.25rem` padding. Hover: 8% lighter. Active: scale(0.98). Shadow: hover glow only, not at rest.
- **Secondary:** Surface Container background, Ink text, same radius. Hover: step up surface tint. No outline/border — tonal, not stroked.
- **Ghost / Text:** Ink or Navy text, transparent background. For lower-emphasis actions in crowded areas (table rows, compact dialogs).
- **Focus:** `2px solid navy @ 40% opacity`, `2px offset` — legible, on-brand, not the default browser ring.

### Inputs / Fields
- **Style:** Container background, 1px outline in Outline color, `0.5rem` radius. Matching Stripe's "clean field" look — no filled/tinted background.
- **Focus:** 2px navy ring at 35% opacity. Border steps to navy. Smooth 120ms transition.
- **Error:** Red border, red helper text below. No red background fill.

### Cards / Containers
- **Background:** Container Low on canvas; Container on Container Low (one step up each time). Never more than two steps of nesting.
- **Radius:** `0.75rem` (12px) — a confident curve, not a sharp corporate rectangle, not a full-pill.
- **Border:** None. Tonal steps distinguish surfaces; borders would be noise.
- **Shadow:** None at rest. Float shadow if the card is a modal or dropdown.
- **Padding:** `1.25rem` standard; `1rem` compact (tables, stat blocks).

### Navigation (App Shell)
- **Top nav:** Surface background, full-width, 1px bottom outline in Container color. Logo left, primary nav center-or-left, actions right.
- **Active state:** Navy text or a 2px navy underbar. No background highlight — text weight/color change only.
- **Mobile:** Collapsible. Nav items at body weight, active state same as desktop.

### Status Chips
- **Shape:** Pill (999px radius), compact — `0.2rem 0.6rem`.
- **Danger:** Risk Red container (12% opacity), Risk Red text.
- **Success:** Compliance Green container, Compliance Green text.
- **Neutral:** Container High background, Ink Muted text.
- **No gradient, no icon-only, no uppercase text** inside chips — sentence-case label only.

## 6. Do's and Don'ts

### Do:
- **Do** use `font-variant-numeric: tabular-nums` on every column with numbers, amounts, or dates.
- **Do** step surfaces tonally (canvas → container-low → container) without borders or dividers.
- **Do** limit the primary navy to primary CTAs, active navigation, and semantic emphasis — ≤10% of any given screen.
- **Do** use Lora only at Headline and Display scale (≥1.125rem); Inter for everything below.
- **Do** balance the landing page with actual product visuals — fleet tables, compliance timelines, alert cards — not abstract diagrams.
- **Do** write UX copy as a peer who runs fleets: short, factual, specific amounts and dates.
- **Do** respect `prefers-reduced-motion`: every transition needs a `no-motion` fallback (typically an instant state change or crossfade).
- **Do** use float shadows only on elevated surfaces (modals, dropdowns), never on static cards.

### Don't:
- **Don't** use the old electric blue (#0050CC, #0266FF) or gradient CTAs from Autiqa v1. That identity is being retired.
- **Don't** use gradient text (`background-clip: text` + gradient). Emphasis via weight or Lora, never visual decoration.
- **Don't** add left-border stripes to cards, list items, or callouts. Tonal backgrounds or icons only.
- **Don't** put Lora below 1.125rem (18px). Below that size a serif becomes noise in a data-dense interface.
- **Don't** use the warm cream/sand/paper body background (OKLCH L 84–97%, C <0.06, hue 40–100). The surface is cool-tinted, not warm-neutral — that band is the AI slop default of 2026.
- **Don't** use the same card grid template (icon + heading + blurb × 3) anywhere on the landing. Show the product, not a feature poster.
- **Don't** add a kicker label (small uppercase eyebrow text) above every section. One deliberate kicker per section max — not repeated scaffolding.
- **Don't** add decorative glassmorphism, blurs, or backdrop-filter cards. Glass earns its place in one precise location (e.g., a sticky nav), never as the default card style.
- **Don't** rely on color alone for compliance severity. Always pair with an icon or label.
- **Don't** write landing copy that claims ("the most powerful", "all-in-one", "effortless"). Show fleet and rental data in context; let operators recognize their own problem.
- **Don't** hard-code Polish vocabulary or PLN into UI components. Currency, date format, and regulatory terminology must be locale-driven.
