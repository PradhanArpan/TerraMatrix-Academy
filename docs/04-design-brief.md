# 04 · Design Brief & Visual Design System

**Project:** TerraMatrix Academy — Engineering Intelligence Platform  
**Design Philosophy:** "Instrument, Not Stationery" (Precision Geotechnical Engineering)  
**Status:** Locked Style Guide  
**Version:** 4.3  
**Date:** 14 October 2026  

---

## 1. Brand Identity & Visual Language

TerraMatrix Academy does not look like a generic marketing SaaS. It looks and feels like a precision engineering instrument: calibrated, grounded, confident, and utilitarian.

- **Primary Metaphor:** Strata, geological strata, deep bedrock, soil mechanics, and precision measurement.
- **Tone:** Technical, academic, rigorous, and professional.
- **Layout Principle:** Generous, intentional white space structured on an 8px geometric grid. High-density information displays paired with breathable macro-layouts.

---

## 2. Locked Color Palette

All color choices are rooted in geological and civil engineering materials (slate, basalt, rich humus, weathered sandstone, and survey markers):

| Token | Hex Value | Semantic Usage | Contrast on Canvas |
| :--- | :--- | :--- | :--- |
| `--tm3-canvas` | `#F6F8F5` | Primary application canvas (limestone mineral tone) | Base (N/A) |
| `--tm3-surface` | `#FFFFFF` | Card, container, and dialog background | High (N/A) |
| `--tm3-ink` | `#0E241E` | Primary headings, high-priority typography, icons | **15.2:1** (WCAG AAA) |
| `--tm3-muted` | `#455851` | Body copy, secondary descriptions, labels | **5.7:1** (WCAG AA Compliant) |
| `--tm3-subtle` | `#5F7069` | Table headers, metadata timestamps, breadcrumbs | **4.7:1** (WCAG AA Compliant) |
| `--tm3-primary` | `#072E25` | Primary brand green (deep forest / moss) | **13.5:1** on `#FFFFFF` |
| `--tm3-green-700` | `#125948` | Secondary interactive elements, active nav states | **8.1:1** on `#FFFFFF` |
| `--tm3-gold` | `#C49535` | Geotechnical ochre / earth accent, verified badges | Accent |
| `--tm3-gold-dark` | `#88631C` | High-contrast gold for text on light backgrounds | **5.1:1** on `#FFFFFF` |
| `--tm3-line` | `#DBE3DE` | Subtle component dividers and card borders | Calibrated 1px |
| `--tm3-line-strong`| `#C8D5CD` | Table headers, active card outlines, input borders | Calibrated 1px |
| `--tm3-danger` | `#B42318` | Destructive alerts, grade deficiencies, errors | High-contrast red |

### Dark Mode System (`data-theme="dark"`)
- `--tm3-canvas`: `#0A1411` (Deep basalt)
- `--tm3-surface`: `#101F1A` (Grounded stratum)
- `--tm3-ink`: `#EDF8F3` (Crisp mineral white)
- `--tm3-muted`: `#ADBBB5` (Contrast > 8.0:1)
- `--tm3-line`: `#2A4138` (Deep bedrock seam)

---

## 3. Typography Hierarchy

| Style | Font Family | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Segoe UI Variable, Inter, sans-serif | 48px – 64px | 850 | 1.05 | Home page hero titles |
| **Section H1** | Segoe UI Variable, Inter, sans-serif | 32px – 40px | 800 | 1.15 | Page intros and dashboard headings |
| **H2 Section** | Inter, -apple-system, sans-serif | 22px – 26px | 750 | 1.25 | Section headings, module titles |
| **H3 Subsection** | Inter, -apple-system, sans-serif | 17px – 19px | 700 | 1.35 | Card titles, modal headers |
| **Body Large** | Inter, sans-serif | 16px | 500 | 1.6 | Introductory summaries |
| **Body Regular** | Inter, sans-serif | 14px – 14.5px | 450 | 1.55 | Paragraphs, documentation text |
| **Caption / Meta** | Inter, sans-serif | 12px – 12.5px | 600 | 1.4 | Badges, timestamps, helper text |
| **Mono Code** | ui-monospace, SFMono-Regular, monospace | 13px | 500 | 1.5 | IDs, hashes, formulas, JSON data |

---

## 4. Spacing, Radius, and Depth Scales

- **Spacing Scale:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Border Radius:**
  - Small (`10px`): Badges, buttons, search input fields
  - Medium (`16px`): Cards, module containers, dropdown menus
  - Large (`24px`): Hero visual panels, modal dialogs, legal documents
  - Pill (`999px`): Navigation pills, category filter tags
- **Shadows:** Kept tight and grounded. Avoid blurry floating shadows.
  - `--tm3-shadow-xs`: `0 1px 3px rgba(6, 31, 26, 0.05)`
  - `--tm3-shadow-sm`: `0 2px 10px rgba(6, 31, 26, 0.07)`
  - `--tm3-shadow-md`: `0 16px 40px rgba(6, 31, 26, 0.10)`

---

## 5. Component Patterns & Interaction Guidelines

- **Buttons:**
  - Primary: Deep forest green (`--tm3-primary`) with pure white text, hover translateY(-1px).
  - Secondary/Minimal: Surface muted (`--tm3-soft`) with subtle border.
  - Destructive: Danger tint with high contrast text.
  - Focus Ring: High-contrast `2px solid var(--tm3-green-700)` with `2px outline-offset`.
- **Form Inputs:**
  - Solid background, crisp `1px solid var(--tm3-line-strong)`, high contrast placeholder.
  - Explicit `<label>` association with `id` and `htmlFor`.
- **Card Grids:**
  - Asymmetric and content-informed grids. Avoid identical cookie-cutter cards.
  - Visual hierarchy prioritizing course title, instructor, duration, and enrollment CTA.

---

## 6. Strict "Avoid" Rules (Anti-Patterns)

1. **NO Purple-to-Blue Gradients:** Strictly forbidden. All gradients must transition between natural earth tones (forest green to deep moss, mineral sand to limestone).
2. **NO Random Emojis as Icons:** All UI icons must be sharp, standardized SVG vectors from `lucide-react`.
3. **NO Everything Centered:** Left-aligned, readable text hierarchy. Centered text is reserved only for select standalone hero tags or empty states.
4. **NO Low-Contrast Muted Text:** Never use light grey (`#A0A0A0` or `#888888`) on light backgrounds. All text must pass WCAG AA (> 4.5:1 ratio).
5. **NO Unlabeled Inputs:** Every input must possess an accessible label for screen readers.
