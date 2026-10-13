# DESIGN.md — Locked Style Guide

> **Style Standard:** "Instrument, not stationery"  
> **Aesthetic Domain:** Precision Geotechnical & Civil Infrastructure Engineering  
> **Status:** Locked Style Guide (Followed across every screen)  
> **Version:** 4.3  

---

## 1. Locked Colour Palette

| Semantic Token | Hex Code | Purpose & Application | Contrast on Light Canvas |
| :--- | :--- | :--- | :--- |
| **bg (canvas)** | `#F6F8F5` | Primary application background (warm mineral limestone) | Base |
| **surface** | `#FFFFFF` | Cards, panels, workspace canvases, modal containers | Base |
| **surface-muted** | `#EDF3EF` | Table header rows, tag backgrounds, secondary surfaces | Base |
| **text (ink)** | `#0E241E` | Primary typography, headers, high-emphasis icons | **15.2:1** (AAA) |
| **muted** | `#455851` | Body descriptions, secondary labels, subtitles | **5.7:1** (AA Compliant) |
| **subtle** | `#5F7069` | Metadata timestamps, breadcrumb links, table subtext | **4.7:1** (AA Compliant) |
| **primary (brand)** | `#072E25` | Deep Forest / Moss green brand anchor | **13.5:1** on `#FFFFFF` |
| **primary-hover** | `#051E18` | Button hover state, active navigation pills | **15.8:1** on `#FFFFFF` |
| **accent (earth gold)**| `#C49535`| Geotechnical ochre, certified badges, key indicators| Accent |
| **accent-dark** | `#88631C` | High-contrast gold text on light backgrounds | **5.1:1** (AA Compliant) |
| **border** | `#DBE3DE` | Subtle card dividers, grid cell borders | 1px clean |
| **border-strong** | `#C8D5CD` | Form input borders, active tabs, header dividers | 1px strong |
| **success** | `#16805F` | Module completion checkmarks, passing grades | High contrast |
| **warning** | `#C49535` | In-progress modules, submission deadlines | High contrast |
| **danger** | `#B42318` | Error alerts, failed submissions, destructive actions| High contrast |

### Dark Theme Tokens (`data-theme="dark"`)
- `bg`: `#0A1411`
- `surface`: `#101F1A`
- `text`: `#EDF8F3`
- `muted`: `#ADBBB5`
- `border`: `#2A4138`
- `primary`: `#125948`

---

## 2. Typography Scale

- **Display Font:** `"Segoe UI Variable Display", Inter, ui-sans-serif, system-ui, sans-serif`
- **Body Font:** `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Monospace Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

| Level | Size | Weight | Line Height | Letter Spacing |
| :--- | :---: | :---: | :---: | :---: |
| **Display H1** | 56px | 850 | 1.05 | `-0.04em` |
| **Page Title H1** | 36px | 800 | 1.15 | `-0.03em` |
| **Section H2** | 24px | 750 | 1.25 | `-0.02em` |
| **Subsection H3**| 18px | 700 | 1.35 | `-0.01em` |
| **Body Regular** | 14.5px | 450 | 1.55 | `0` |
| **Caption / Meta**| 12px | 600 | 1.4 | `+0.01em` |
| **Eyebrow Tag** | 10.5px| 800 | 1.2 | `+0.08em` (Uppercase) |

---

## 3. Spacing, Radius, and Depth Scale

- **Spacing Scale:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Border Radius:**
  - `small`: `10px` (inputs, buttons, badges)
  - `medium`: `16px` (cards, menus, modules)
  - `large`: `24px` (panels, hero containers, legal blocks)
  - `pill`: `999px` (navigation tags, status pills)
- **Shadows:**
  - `sm`: `0 2px 10px rgba(6, 31, 26, 0.07)`
  - `md`: `0 16px 40px rgba(6, 31, 26, 0.10)`
  - `lg`: `0 32px 90px rgba(6, 31, 26, 0.16)`

---

## 4. Component Rules

- **Buttons:** Minimum height 42px. Forest green background (`--tm3-primary`) with pure white text, hover translateY(-1px). Visible focus outline `2px solid var(--tm3-green-700)` with `2px outline-offset`.
- **Inputs:** Solid background (`--tm3-surface`), 1px solid `--tm3-border-strong`, border-radius 10px, explicit `<label>` element.
- **Cards:** White surface with subtle 1px border. No floating blurry drop shadows. Padding: 20px–24px.
- **Navigation:** Sticky, backdrop-filter blur 20px, clear active pill state.
- **Tables:** Structured header row with uppercase 11px label, zebra hover rows, explicit cell padding (12px 14px).

---

## 5. Strict "Avoid" Rules

1. **NO purple-to-blue gradients.**
2. **NO emojis as functional icons.** Always use Lucide React icons.
3. **NO everything centered.** Keep content structured with left-aligned readable flow.
4. **NO low-contrast muted text.** Faint text must never drop below 4.5:1 ratio.
5. **NO horizontal scrollbars on mobile.** Strict viewport confinement at 320px width.
