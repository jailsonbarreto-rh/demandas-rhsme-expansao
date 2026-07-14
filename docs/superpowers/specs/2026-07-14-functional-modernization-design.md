# Functional Modernization Design

## Goal

Modernize the production toolchain and reliability of the Central de Demandas without changing business rules, Supabase data, RLS policies or user permissions.

## Functional gains

- Real Chromium smoke tests in desktop and mobile viewports.
- Inter and Font Awesome hosted inside the application bundle.
- Supabase client typed from the source without an unsafe cast.
- Node.js 24 aligned across development, CI and deployment.
- Compatible upgrades of React, Supabase JS, Vite, Vitest and supporting packages.

## Scope boundaries

- Keep the existing React/Vite SPA architecture.
- Keep TypeScript on the latest compatible 5.9 release.
- Do not add state management, SSR, PWA, analytics or database changes.
- Merge only after audit, unit tests, production build, browser tests and Vercel Preview succeed.
