# locum — Development Guidelines

This document captures project-specific practices for building, testing, and contributing to the codebase. It assumes familiarity with Next.js, React 19, TypeScript, Vitest, and general frontend tooling.

## Build, Run, and Type Safety

- Node & npm versions are managed via Volta (see `package.json` → `volta`). Use the pinned toolchain for reproducibility:
  - Node: 24.11.1
  - npm: 11.6.3
  - Minimum engine: Node >= 20 (engines field)
  - Recommended: install Volta to automatically pick versions.

- Install deps:
  - `npm ci` (preferred, CI‑reproducible)
  - For local dev after lockfile changes: `npm install`

- Development server (Next.js 16 with Turbopack):
  - `npm run dev` (serves on port 9002)
  - If the port is busy, pass `-p` or set `PORT` env. Current script already uses `-p 9002`.

- Build:
  - `npm run build` (Next.js build)
  - Production start: `npm run start`

- Type checking:
  - `npm run typecheck`
    - Runs `next typegen` (generates Next.js types) then `tsc --noEmit`.

- Formatting and linting (Biome):
  - `npm run format` → apply formatting fixes
  - `npm run lint` → apply lint fixes
  - `npm run check` → run both (`biome check`)
  - CI preflight: `npm run preflight` (format → lint → build → typecheck)

- Unused code and deps analysis:
  - `npm run knip` (config: `knip.json`)

## Testing

- Test runner: Vitest v4, jsdom environment.
- Primary config: `vitest.config.ts`
  - `environment: 'jsdom'`
  - `setupFiles: ['./test/setup.ts']` — adds DOM matchers (`@testing-library/jest-dom`) and polyfills (`matchMedia`, `ResizeObserver`). If components depend on these APIs, tests should run without additional shims.
  - `include: ['src/**/*.{test,spec}.{ts,tsx}']` — place unit/integration tests anywhere under `src/` with `.test.ts[x]` or `.spec.ts[x]` suffix.
  - Coverage is enabled by default for `vitest run` with V8 provider.

- Secondary/mobile test profile: `vitest.mobile.config.ts`
  - Tailored includes for mobile‑focused tests under `src/test/**` and specific hooks/components.
  - Additional reporters and coverage thresholds for mobile targets.
  - Use it explicitly when needed (see commands below).

- Commands:
  - Run all tests once (headless): `npm test` (alias for `vitest run`)
    - Note: the repository currently contains some failing tests in the default suite. Prefer targeted runs during local development.
  - Watch mode: `npm run test:watch` (interactive UI)
  - Coverage: `npm run test:coverage`
  - Targeted file(s): `npx vitest run path/to/file.test.tsx`
  - Pattern (globs): `npx vitest run "src/**/my-*.test.ts"`
  - Using the mobile profile: `npx vitest --config vitest.mobile.config.ts run`

- Adding a new test (recommendations):
  - Place it under the same directory as the code (co‑located) or a nearby `__tests__` folder, but ensure it matches `src/**/*.{test,spec}.{ts,tsx}`.
  - Prefer Testing Library for React component tests:
    ```ts
    import { render, screen } from '@testing-library/react'
    import { describe, it, expect } from 'vitest'
    import React from 'react'
    
    describe('MyWidget', () => {
      it('renders label', () => {
        render(<div>Hello</div>)
        expect(screen.getByText('Hello')).toBeInTheDocument()
      })
    })
    ```
  - If your component uses `matchMedia` or `ResizeObserver`, no extra polyfill is needed — they are provided in `test/setup.ts`.
  - If you introduce APIs not in jsdom (e.g., `IntersectionObserver`, `Web Animations`), add light-weight stubs in `test/setup.ts` to keep tests hermetic.

- Demonstrated working example (verified during guideline authoring):
  - We created a minimal test at `src/smoke.test.tsx` that renders a component and asserts text via Testing Library. Running:
    - `npx vitest run src/smoke.test.tsx` → passed locally
  - The file was subsequently removed to keep the repo clean as these guidelines are committed.

- Troubleshooting:
  - If running the whole suite yields failures unrelated to your change, run focused tests (file or test name regex) to iterate quickly.
  - On Windows/PowerShell, wrap globs in quotes to prevent expansion by the shell.
  - If you see read‑only input warnings from React in tests, either provide `onChange` or use `defaultValue` in test fixtures.

## Project Conventions and Code Style

- TypeScript: strict mode enabled with several safety flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc.). Keep types precise; prefer `zod` for runtime validation when needed.
- Paths: alias `@/*` → `./src/*` per `tsconfig.json`. Prefer aliased imports for intra‑repo modules.
- React 19 + Next 16: use Server/Client Components appropriately. Co-locate component tests next to Client Components. For MDX content, see `src/lib/quick-reference-database/**` and related loaders.
- Styling: Tailwind CSS v4 with `@tailwindcss/typography` and `tailwindcss-animate`. Prefer utility classes; group with `tailwind-merge` where conditional.
- UI/UX: Radix UI primitives are in use; jsdom setup includes polyfills required by Radix.
- State: `zustand` is used for stores; test stores in isolation where possible; use `act` when triggering updates that schedule React state changes.
- Linting/formatting: Biome governs both. Avoid ESLint/Prettier configs — they’re not part of this repo.
- Commits/CI: use `npm run preflight` before pushing significant changes to catch formatting, linting, build, and type issues early.

## Domain Notes (Quick Reference Database)

- Clinical quick‑reference content lives under `src/lib/quick-reference-database/**`.
  - Example medication entries: `src/lib/quick-reference-database/medications/antibiotics/*.ts` and full MDX in `medications-full/*.mdx`.
  - Types: `src/lib/quick-reference-database/types` (see import usage in `antibiotics/*.ts`). Keep dose structures consistent with `QuickReferenceMedication` (ids, units, maxDose semantics, enabling flags).
  - When extending the database:
    - Add a typed entry file and export it via the nearest `index.ts` so it’s discoverable.
    - For MDX content, keep frontmatter consistent and validate links in the preview.

## Common Pitfalls

- Mismatched Node/npm versions can cause Next.js or Vite plugin errors. Use Volta or `nvm` to match Node 24.
- If Vitest can’t resolve path aliases, ensure `vite-tsconfig-paths` is active (it is in both configs) and that tests run via the Vitest CLI (not `ts-node`).
- Tests outside `src/` (except those explicitly included by the mobile config) are ignored by the main config.
- If a component relies on browser APIs not present in jsdom, add targeted shims in `test/setup.ts` rather than mocking React or DOM globally.

## Quick Commands Cheat‑Sheet

- Dev: `npm run dev` (http://localhost:9002)
- Build: `npm run build` → `npm start`
- Types: `npm run typecheck`
- Format: `npm run format`
- Lint: `npm run lint`
- Tests:
  - All (headless): `npm test`
  - Watch: `npm run test:watch`
  - Coverage: `npm run test:coverage`
  - Single file: `npx vitest run src/path/to/file.test.tsx`
  - Mobile profile: `npx vitest --config vitest.mobile.config.ts run`
