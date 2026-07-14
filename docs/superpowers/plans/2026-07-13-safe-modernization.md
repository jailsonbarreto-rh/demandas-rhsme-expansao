# Safe Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the React, Vite, Supabase and test toolchain without changing production data or accepting an update that fails audit, automated tests, browser smoke tests or the production build.

**Architecture:** Keep the current Vite SPA and Supabase service boundaries. Improve type safety at the client factory, add deterministic browser testing in local mode, pin Node 24, automate dependency maintenance and regenerate the npm lockfile only after the full verification pipeline passes.

**Tech Stack:** React 19, Vite, TypeScript 5.9, Supabase JS, Vitest, Playwright, GitHub Actions and Dependabot.

## Global Constraints

- Do not migrate to TypeScript 7 in this change set.
- Do not alter Supabase tables, RLS policies, users or production data.
- Do not merge unless npm audit, unit tests, browser tests and build all pass.
- Keep `VITE_APP_MODE=local` for deterministic browser tests.

---

### Task 1: Runtime and dependency baseline

**Files:** `package.json`, `package-lock.json`, `.nvmrc`, `.github/dependabot.yml`

- [x] Pin Node 24 and add repeatable verification scripts.
- [ ] Update compatible runtime and development dependencies.
- [x] Add weekly npm and GitHub Actions maintenance.

### Task 2: Typed Supabase client

**Files:** `src/lib/supabase.ts`, `src/services/createAppServices.ts`

- [x] Instantiate `createClient<Database>` directly.
- [x] Remove the unsafe `as SupabaseClient<Database>` cast.
- [x] Preserve the existing singleton client and service contracts.

### Task 3: Browser-level QA

**Files:** `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/dependency-health.yml`

- [x] Test desktop and mobile Chromium profiles.
- [x] Exercise login, demand opening and the edit modal.
- [x] Fail on browser console errors.
- [x] Run the browser smoke test in pull-request CI.

### Task 4: Verification gate

- [ ] Run `npm audit --audit-level=high`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run build`.
- [ ] Commit dependency versions only after every command succeeds.
