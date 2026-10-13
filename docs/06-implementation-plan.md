# 06 · Implementation Plan & Morning Deployment Runbook

**Project:** TerraMatrix Academy — Engineering Intelligence Platform  
**Target Execution:** Immediate local readiness + Morning Supabase & Vercel Linking  
**Status:** Phases 1–5 Complete · Phase 6 Ready for Morning Trigger  
**Version:** 4.3  
**Date:** 14 October 2026  

---

## 1. Project Implementation Phases

| Phase | Description & Objectives | Key Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1: Decoupling & Discovery** | Find all local files, sync remote GitHub branch, remove broken Google Apps Script redirect bridge. | Clean git branch `supabase-clean`, synced with `academy/main`, eliminated GAS runtime crashes. | **COMPLETED** |
| **Phase 2: UI/UX & Color System** | Apply "Instrument, not stationery" aesthetic, ensure WCAG AA color contrast, responsive mobile navigation, focus rings. | Updated `design-system.css`, tightened typography hierarchy, enhanced palette tokens. | **COMPLETED** |
| **Phase 3: Supabase Architecture** | Place 22KB database schema in repo, build dual-mode Supabase client with offline fallback. | `supabase/schema.sql`, `src/lib/supabaseClient.ts`, updated `src/lib/appsScriptApi.ts`. | **COMPLETED** |
| **Phase 4: Compliance & Legal** | Complete DPDP Act 2023, IT Act 2000, and GDPR alignment with real UI banner and legal documents. | `ConsentBanner.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, wired into router & footer. | **COMPLETED** |
| **Phase 5: Specification & Docs** | Author the 6 Vibe-Spec-Pack docs, README, HANDOUT, RULES, ARCHITECTURE, DESIGN, and COMPLIANCE. | `docs/01-06`, `README.md`, `HANDOUT.md`, `RULES.md`, `ARCHITECTURE.md`, `DESIGN.md`, `COMPLIANCE_AND_SECURITY.md`. | **COMPLETED** |
| **Phase 6: Morning Linking** | Create new Supabase project, execute `schema.sql`, link GitHub to Vercel, inject environment variables. | Live production URL on Vercel backed by dedicated Supabase PostgreSQL. | **READY TO RUN** |

---

## 2. Morning Deployment Runbook (For User Tomorrow Morning)

When you are ready to link Supabase and Vercel in the morning, follow this straightforward 5-minute procedure:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**, choose an organization, name it `terramatrix-academy`, set a secure database password, and select a close region (e.g., `South Asia (Mumbai)` or `Frankfurt`).
3. Once the database is provisioned (takes ~60 seconds):
   - In the Supabase left navigation, open **SQL Editor**.
   - Click **New Query**, open `supabase/schema.sql` from this repository, paste the entire SQL content, and click **Run**.
   - All 14 tables, relations, and initial seed categories will be created instantly.

### Step 2: Copy API Keys
1. In Supabase, go to **Project Settings** → **API**.
2. Note the two values:
   - **Project URL:** e.g., `https://abcdefghijkl.supabase.co`
   - **anon / public key:** `eyJhbGciOi...`

### Step 3: Link to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import the GitHub repository: `PradhanArpan/TerraMatrix-Academy`.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. Click **Deploy**.
5. Vercel will run `npm run build` and publish your live, blazing-fast production portal at `https://terramatrix-academy.vercel.app` (or your custom domain) with 0 errors!

---

## 3. Verification & Quality Gates Checklist

- [x] TypeScript compilation passes (`tsc -b`) with 0 errors.
- [x] Vite production build succeeds (`dist/index.html` and bundled assets generated).
- [x] `window.google?.script?.run` redirect removed from `main.tsx`.
- [x] `vercel.json` configured with clean SPA rewrites (`"destination": "/index.html"`).
- [x] Color contrast ratios verified for WCAG AA compliance (> 4.5:1 for muted text).
- [x] Focus rings visible and keyboard-navigable (`:focus-visible`).
- [x] Consent banner actively prompts for DPDP Act 2023 / GDPR storage preferences.
- [x] Dedicated Privacy Notice and Terms of Service available on public routes (`#/privacy`, `#/terms`).
- [x] Git branch `supabase-clean` ready to push or merge into `main`.
