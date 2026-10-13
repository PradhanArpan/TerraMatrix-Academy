# TerraMatrix Academy

> **Engineering Intelligence Platform** for applied geotechnics, computational earth modeling, continuous professional development, and certified competency.

[![Framework: React 19](https://img.shields.io/badge/Framework-React%2019-072E25?style=flat-square)](https://react.dev/)
[![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-C49535?style=flat-square)](https://www.typescriptlang.org/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square)](https://supabase.com/)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel%20Edge-000000?style=flat-square)](https://vercel.com/)
[![Compliance: India DPDP 2023](https://img.shields.io/badge/Compliance-DPDP%20Act%202023-125948?style=flat-square)](#compliance--regulatory-standards)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-gray?style=flat-square)](LICENSE)

---

## 1. Overview

**TerraMatrix Academy** is an applied engineering education and intelligence platform developed for students, practicing geotechnical and civil engineers, researchers, and infrastructure leaders. 

The platform connects theoretical rock and soil mechanics with real-world computational modeling, field data analysis, and professional design codes (IS, Eurocode, ASTM).

### Core Capabilities
- **Curated Course Catalog:** Comprehensive pathways spanning soil mechanics, slope stability, deep foundations, rock engineering, and tunnel design.
- **Learner Classroom:** Interactive module navigation, video lecture streaming, companion computational worksheets, and progress tracking.
- **Instructor Portal:** Dedicated faculty management suite for reviewing cohort enrollments, grading capstone submissions, and uploading syllabus modules.
- **Admin Command Center:** Operational management for course publishing, user administration, credential issuance, and database health monitoring.
- **Event & Workshop Hub:** Live webinars and multi-day intensive computational workshops (PLAXIS, GeoStudio, Python for Geotechnics).
- **Verifiable Certification:** Tamper-evident digital certificates equipped with SHA-256 cryptographic validation fingerprints.

---

## 2. Modernized Architecture: Pure GitHub + Supabase + Vercel

The platform has been completely modernized from a legacy Google Apps Script bridge into an ultra-fast, decoupled modern web stack:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Edge Global CDN               │
│         (Static React 19 + TypeScript SPA)             │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / REST │ Auth JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Cloud                       │
│    ├── PostgreSQL 15+ (Relational Database)            │
│    ├── Row-Level Security (Multi-tenant RBAC)          │
│    ├── Supabase Auth (Learner / Faculty / Admin)       │
│    └── Supabase Storage (Materials & Submissions)      │
└────────────────────────────────────────────────────────┘
```

- **Zero External Runtime Crashes:** Eliminated dependencies on `window.google?.script?.run`.
- **Offline / Standalone Resilience:** If database environment variables are not supplied, the app gracefully falls back to pre-seeded local storage data without crashing.
- **Single Page Application Routing:** Clean client-side SPA routing via `HashRouter` with Vercel rewrites configured in `vercel.json`.

---

## 3. Quick Start & Local Development

### Prerequisites
- **Node.js:** v18.0.0 or later (Node 20+ recommended)
- **npm:** v9.0.0 or later

### Installation
```bash
# Clone the repository
git clone https://github.com/PradhanArpan/TerraMatrix-Academy.git
cd TerraMatrix-Academy

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```
Executes TypeScript type checking (`tsc -b`) and bundles production assets into `dist/` in ~3 seconds with zero errors.

---

## 4. Supabase Setup Guide

The complete relational schema (14 tables, relations, and initial seed categories) is located in `supabase/schema.sql`.

1. Sign in to your [Supabase Dashboard](https://supabase.com) and create a new project named `terramatrix-academy`.
2. Open the **SQL Editor** in your Supabase project.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql), paste into the editor, and click **Run**.
4. Retrieve your **Project URL** and **anon / public key** under **Project Settings** → **API**.
5. Create a `.env` file in your project root (or set in Vercel):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## 5. Vercel Deployment

Deploying TerraMatrix Academy to Vercel takes less than two minutes:

1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com), select **Add New...** → **Project**.
3. Import `PradhanArpan/TerraMatrix-Academy`.
4. In the project settings, add the Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**. Vercel will build and serve your app globally on its Edge network.

---

## 6. UI/UX Design System: "Instrument, Not Stationery"

The interface has been curated using modern engineering principles:

- **Geological Palette:** Deep Forest Moss (`#072E25`), Geotechnical Ochre (`#C49535`), Mineral Limestone Ground (`#F6F8F5`), and Basalt Charcoal (`#0E241E`).
- **WCAG AA Compliance:** All body and muted typography has been contrast-audited (> 4.8:1 ratio) for high readability in both light and dark modes.
- **Accessible Interactions:** Visible keyboard focus indicators (`:focus-visible`), aria landmark roles, skip-to-content navigation, and minimum 44px touch targets.
- **Anti-AI-Cliches:** No artificial purple-to-blue gradients, no non-semantic emojis, and no identical blurry floating cards.

---

## 7. Compliance & Regulatory Standards

TerraMatrix Academy is engineered to adhere to strict national and international data privacy and ed-tech standards:

- **India DPDP Act 2023 (Digital Personal Data Protection Act):** Built-in explicit consent banner, data minimisation, child/minor protection without behavioral tracking, and data principal rights.
- **IT Act 2000 & SPDI Rules 2011:** IS/ISO/IEC 27001 aligned security safeguards, designated Grievance Redressal Officer (`grievance@terramatrix.in`).
- **CERT-In Cyber Security Directions:** Secure audit logging architecture and incident response readiness.
- **GDPR (EU/UK):** Transparent cookie/storage notices and lawful processing basis.

---

## 8. Comprehensive Documentation Suite

For detailed technical and operational specifications, review the companion documentation:

| Document | Location | Purpose |
| :--- | :--- | :--- |
| **Product Requirements** | [`docs/01-prd.md`](docs/01-prd.md) | Personas, user stories, feature breakdown, KPIs. |
| **Technical Requirements** | [`docs/02-trd.md`](docs/02-trd.md) | Technical stack, edge routing, performance metrics. |
| **Application Flow** | [`docs/03-app-flow.md`](docs/03-app-flow.md) | User journeys, click flows, Mermaid diagrams. |
| **Design Brief** | [`docs/04-design-brief.md`](docs/04-design-brief.md) | Locked style guide, tokens, typography, avoid rules. |
| **Backend Schema** | [`docs/05-backend-schema.md`](docs/05-backend-schema.md) | Database tables, ER diagram, RBAC, RLS policies. |
| **Implementation Plan** | [`docs/06-implementation-plan.md`](docs/06-implementation-plan.md) | Phases, milestones, morning setup runbook. |
| **Orientation Handout** | [`HANDOUT.md`](HANDOUT.md) | Academic syllabus, faculty orientation, credential guide. |
| **Engineering Rules** | [`RULES.md`](RULES.md) | Vibe-Coding conventions, code quality gates, a11y rules. |
| **System Architecture** | [`ARCHITECTURE.md`](ARCHITECTURE.md) | Deep architectural reference and security design. |
| **Style Guide** | [`DESIGN.md`](DESIGN.md) | Level 3 locked tokens, typography, and component patterns. |
| **Compliance Report** | [`COMPLIANCE_AND_SECURITY.md`](COMPLIANCE_AND_SECURITY.md) | Legal compliance audit under Indian & International laws. |

---

## 9. Contact & Support

- **Repository:** [https://github.com/PradhanArpan/TerraMatrix-Academy](https://github.com/PradhanArpan/TerraMatrix-Academy)
- **Academic Inquiries:** `academy@terramatrix.in`
- **Data Privacy & Grievances:** `grievance@terramatrix.in`
- **Lead Developer & Architect:** Arpan Pradhan

---
*© 2026 TerraMatrix Academy. All rights reserved.*
