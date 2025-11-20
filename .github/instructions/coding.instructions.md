---
applyTo: "**/*"
---

# 🚀 Next.js Coding Guidelines

Next.js introduces specific patterns and APIs that require focused guidelines to ensure optimal performance, maintainability, and leverage its full feature set.

## 1\. 📂 Project Structure and File Organisation

A well-organised structure is vital for large Next.js applications.

- **`src/` Directory:** Prefer placing most application code within a top-level `src/` directory (e.g., `src/app`, `src/pages`, `src/components`). This cleanly separates application logic from configuration files and build outputs.
- **`app` Router (Recommended):**
  - **Pages:** Place route segments inside the `app/` directory. Use the convention `page.tsx` for route components and `layout.tsx` for shared UI across a segment.
  - **Loading and Error:** Use `loading.tsx` and `error.tsx` files within route segments to define loading skeletons and error boundaries for improved user experience.
  - **Route Handlers:** Use `route.ts` for API endpoints within the `app` directory.
- **Components:**
  - **Atomic Design:** Organise components into logical groups (e.g., `components/atoms`, `components/molecules`, `components/organisms`).
  - **Colocation:** For components that are only used within a specific route segment, consider placing them in a `components/` sub-folder *within that segment* for better locality.
- **Absolute Imports:** Configure `tsconfig.json` to use **absolute imports** (e.g., `@/components/Button`) instead of relative imports (e.g., `../../../components/Button`). This keeps imports clean and refactoring easy.

---

## 2\. 🎣 Data Fetching and Caching

Proper data fetching is crucial for performance. **Prefer the App Router's data fetching model over the legacy `getServerSideProps` / `getStaticProps` patterns.**

- **Server Components First:** Default to **React Server Components (RSCs)** for all non-interactive logic, including data fetching. Data fetching should happen directly in Server Components using `await fetch()`.
  - **Automatic Caching:** By default, `fetch()` calls in RSCs are automatically memoised, and the results are cached across requests, leveraging Next.js's data caching mechanism.
- **Server Actions for Mutations:** Use **Server Actions** for all data mutations (updates, deletes) instead of dedicated API routes when possible.
- **Client Component Data Fetching:** Only fetch data in Client Components when:
  - The data relies on **browser-specific APIs** (e.g., geo-location).
  - The data needs to be **continuously revalidated** on the client side (use a library like SWR or React Query).
  - Use the **`use client`** directive at the top of the file to mark it as a Client Component.

## 3\. 🧩 Components and Rendering

Optimising where and how components render directly impacts site performance.

- **"Use Client" Boundary:** Minimise the use of the **`use client`** directive. Place it at the lowest possible level.
  - **Pattern:** Create small **Client Wrapper Components** that encapsulate the interactive logic, and pass all static data and non-interactive children as props from the parent Server Component.
- **Server Component Props:** Server components can accept any serialisable props. **Avoid passing entire components (JSX) as props** to another Server Component; pass data instead.
- **Dynamic Components:** Use **`next/dynamic`** to lazy-load components that are not critical for the initial load. This reduces the initial JavaScript bundle size.

## 4\. 🔗 Routing and Navigation

- **`next/link`:** Always use the **`<Link>`** component from `next/link` for internal navigation. Do not use standard `<a>` tags for internal routes, as `<Link>` handles prefetching and client-side transitions.
- **`next/navigation`:** Use functions from `next/navigation` (e.g., `useRouter`, `redirect`) for programmatic navigation within the App Router, ensuring type safety and compatibility.

## 5\. ⚡ Performance and Optimisation

- **Image Optimisation:** Always use the **`<Image>`** component from `next/image` for locally hosted images. This ensures proper size optimisation, lazy loading, and correct caching.
- **Font Optimisation:** Use **`next/font`** for local font files and Google Fonts. This automatically handles font file optimisation and self-hosting, eliminating external network requests and ensuring fonts are loaded efficiently.
- **Environment Variables:** Use the `NEXT_PUBLIC_` prefix for any environment variables intended to be exposed to the browser (Client Components). All other variables are assumed to be **server-only** for security.

## 6\. 📝 Documentation (Next.js Specific)

- **Component Type:** In the JSDoc for components, always specify if it is a **Client Component** or a **Server Component**.

    ```typescript
    /**
     * @file A reusable button component.
     * @component Client Component
     * @param onClick The click handler.
     * @param children The button content.
     */
    'use client';
    export default function Button({ onClick, children }: ButtonProps) {
        // ...
    }
    # 🚀 Next.js Coding Guidelines (Concise)

    This file gives focused, actionable guidelines for working in this Next.js + TypeScript repository. Keep changes small, run `npm run preflight`, and prefer consistency with existing code.

    ## Quick Tooling

    - Install: `npm ci`.
    - Dev: `npm run dev` (project commonly runs on port `9002`).
    - Preflight: `npm run preflight` — run this before opening PRs.

    ## Project Structure

    - Keep application code under `src/` (e.g., `src/app`, `src/components`, `src/lib`).
    - Use the App Router (`src/app`) with `page.tsx` and `layout.tsx` segments. Add `loading.tsx` and `error.tsx` where useful.
    - Co-locate small components with the route that uses them. Use absolute imports via `tsconfig.json` (e.g., `@/components/Button`).

    ## Rendering & Data

    - Prefer Server Components for non-interactive UI and fetch data with `await fetch()` in those components to use Next.js caching.
    - Use Server Actions for server-side mutations when possible; prefer client fetching only for browser-specific needs or live revalidation (SWR/React Query).
    - Minimise `"use client"`; put it only on leaf components that need it.

    ## Navigation & Splitting

    - Use `next/link` for internal navigation and `next/navigation` (e.g., `useRouter`, `redirect`) for programmatic flows.
    - Lazy-load non-critical components with `next/dynamic` to reduce initial bundle size.

    ## TypeScript & APIs

    - Avoid `any`; prefer `unknown` and narrow. Always export explicit return types for public functions.
    - Use `import type` for types, `type` aliases for unions/aliases, and `interface` when extension or implementation is expected.
    - Use `readonly` / `Readonly<T>` for immutable APIs; prefer `Array<T>` in public types.

    ## Exports, Naming & Files

    - Prefer named exports. File names: `kebab-case`. Types/interfaces: `PascalCase`. Functions/variables: `camelCase`. Constants: `SCREAMING_SNAKE_CASE`.

    ## Formatting & Style

    - Indentation: 4 spaces. Use semicolons. Prefer single quotes except when a single-quote character appears in the string.
    - Avoid nested ternaries; prefer clear `if`/`else` blocks. Keep functions small and single-responsibility.

    ## Tests, Linting, Accessibility

    - Use Vitest for tests; place tests near the code. Use `vi.mock()` at the top for module mocks.
    - Run `npm run lint` and `npm run format` as needed. Run `npm run preflight` before merging.
    - Prefer semantic HTML, keyboard accessibility, and minimal client JS for better performance.

