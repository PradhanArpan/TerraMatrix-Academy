# Engineering Rules & Development Conventions

**Project:** TerraMatrix Academy  
**Standard:** Vibe-Coding Toolkit + Production Engineering Quality Gates  
**Status:** Mandatory Codebase Law  
**Version:** 4.3  
**Date:** 14 October 2026  

---

## 1. Core Engineering Commandments

### Rule 1: Spec First, Code Second
No new feature or architectural refactor may be implemented without updating the corresponding specification document in `docs/` (`docs/01-prd.md` through `docs/06-implementation-plan.md`). Code is an artifact of the spec, not vice versa.

### Rule 2: Zero Broken Links & Zero Hardcoded Redirections
- Every navigation link, button, or CTA must resolve to a valid route in `src/App.tsx`.
- Never use forceful window redirection scripts that hijack the browser (e.g., the legacy `window.location.replace` to Google Apps Script).
- All external links must open in a new tab with `target="_blank" rel="noopener noreferrer"`.

### Rule 3: Graceful Offline & Standalone Degradation
- The frontend must never crash if Supabase credentials are missing or the backend cluster is temporarily unreachable.
- `src/lib/supabaseClient.ts` must use `isSupabaseConfigured()` to guard live database calls.
- If unconfigured, the application must automatically fall back to cached/pre-seeded data in `src/lib/appsScriptApi.ts`.

### Rule 4: Zero Leaked Secrets
- **NEVER** commit service role keys, master passwords, or private API keys to git.
- Only public variables prefixed with `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) may be exposed in the frontend.
- All secrets must reside in `.env` (git-ignored) or Vercel Environment Variables.

---

## 2. UI/UX & Design Conventions ("Instrument, Not Stationery")

### Rule 5: Color Contrast Guarantee (WCAG 2.1 AA)
- Normal text must achieve a minimum contrast ratio of **4.5:1** against its background.
- Large text ($\ge 18$pt or $\ge 14$pt bold) must achieve a minimum contrast ratio of **3.0:1**.
- Muted helper text must never be faded to unreadable light grey; use `--tm3-muted: #455851` on light canvas (5.7:1 ratio).

### Rule 6: Anti-AI-Cliches (Forbidden Visual Patterns)
1. **NO Purple-to-Blue Gradients:** Strictly prohibited. Use natural earth, slate, and geological tones.
2. **NO Emojis as UI Icons:** Never use emojis (e.g., 📚, 🎓, 🚀) as functional UI icons. Always use crisp SVG icons from `lucide-react`.
3. **NO Everything Centered:** Structure layouts with clear left-aligned visual anchors and intentional scanning lines.
4. **NO Identical Generic Cards:** Group content according to its nature (asymmetric split layouts, metadata tags, structured tables).

### Rule 7: Accessible Keyboard & Touch Targets
- All interactive controls must display a visible focus indicator using `outline: 2px solid var(--tm3-green-700); outline-offset: 2px`.
- Touch targets on mobile must have a minimum physical size of **44px × 44px**.
- Mobile navigation overlays must trap focus and lock `document.body` scrolling when open.

---

## 3. TypeScript & Code Quality Standards

### Rule 8: Zero-Error Build Policy
Before committing code or pushing to GitHub:
```bash
npm run build
```
This command executes `tsc -b && vite build`. If TypeScript reports even 1 error or warning, the build is considered **FAILED** and must be resolved before pushing.

### Rule 9: Component Architecture & Modularity
- Large pages (like `AdminDashboard.tsx`, `StudentPortal.tsx`) must be organized into logical, readable subcomponents.
- Shared UI primitives must reside in `src/components/Ui.tsx` (`Eyebrow`, `SectionHeading`, `Badge`, `EmptyState`, `Metric`, `PageIntro`).
- Reusable legal, cookie, and compliance dialogs must reside in `src/components/`.

---

## 4. Git & Branching Hygiene

### Rule 10: Clean Branch Strategy
- `main`: Production release branch. Tracked directly by Vercel for live production deployment.
- `supabase-clean`: Staging branch for Supabase integration, compliance audits, and clean refactoring.
- `local-backup-main`: Permanent safety snapshot branch preserving all pre-existing local experiments.

Always run `git status` and ensure untracked files are properly committed or git-ignored before switching branches.
