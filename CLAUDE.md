# Agent Rules & Codebase Hygiene Charter (TerraMatrix Academy)

## Core Philosophy
1. Deleting code is a first-class engineering task. AI assistants must simplify, refactor, and prune rather than blindly accumulate files.
2. Every change must be small, reviewable, and accompanied by deterministic verification proof.
3. Before writing new utility functions or components, search existing helpers (`src/lib/` and `src/components/Ui.tsx`) and reuse them.

---

## 1. The Never-Delete List (MANDATORY GUARDRAIL)
Never delete, rename, or unbind the following files, endpoints, or callbacks without explicit written authorization:
- **Payment & Subscription Webhooks:** `supabase/functions/stripe-webhook/*` or any route handling `customer.subscription.*`, `invoice.payment_*`.
- **Authentication Callbacks:** Supabase Auth redirect handlers (`/auth/v1/callback`, OAuth Google/GitHub callback URLs).
- **Scheduled Operational Crons:** `supabase/functions/compliance-alerts-cron/*` (DMCA agent renewal and compliance monitors).
- **Transactional Email Workers:** Resend/SendGrid delivery endpoints.
- **Public Legal Endpoints:** `src/pages/TermsOfService.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/DmcaPolicy.tsx`, `src/pages/AccessibilityStatement.tsx`.
- **Auditable Log Tables:** `user_consent_audit_log`, `dmca_takedown_notices`, `dmca_repeat_infringers`.

*Reason:* External services (Stripe, OAuth providers, U.S. Copyright Office) invoke these endpoints from outside this repository. Static code analysis (like Knip) will wrongly flag them as "unused".

---

## 2. Post-Feature Cleanup Routine
After completing ANY feature, the AI assistant MUST execute:
1. **Search before writing:** Check `src/lib/` and `src/components/Ui.tsx` for existing helpers (formatters, date handlers, badges, buttons) before creating new ones.
2. **Deterministic dead code check:** Run `npm run audit:deadcode` (`knip`).
3. **Deterministic duplicate check:** Run `npm run audit:dupes` (`jscpd`).
4. **Route Inventory Sync:** Run `npm run inventory:routes` to ensure all endpoints match `docs/API_AND_ROUTE_INVENTORY.md`.
5. **Run the `/simplify` pass:** Review git diff for unnecessary abstractions, duplicated types, and unused imports.

---

## 3. Accessibility & Compliance Verification
- Never use automated overlay widgets (AccessiBe/UserWay). Implement native semantic HTML and ARIA.
- Ensure all interactive controls have `:focus-visible` styling and accessible names.
- Ensure all forms have explicit `<label htmlFor="...">` associations.
- Verify color contrast passes WCAG 2.2 AA (4.5:1 normal text, 3:1 large text).
