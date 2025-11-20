---
applyTo: "**/*"
---

# Additional Instructions

When making edits to the codebase, please adhere to the following guidelines:

This file lists short, practical rules to keep code consistent, accessible, and maintainable.

Globals & parsing

- Prefer `globalThis` for the global object; avoid `window`, `self`, or `global` directly.
- Use `Number.parseInt(str, 10)` and `Number.parseFloat(str)` for parsing numbers; always pass a radix to `parseInt`.

Accessibility

- Prefer semantic HTML elements over explicit ARIA roles when possible (use native `<button>`, `<progress>`, headings, etc.).
- For progress controls, prefer the `progress` semantic element or ensure ARIA usage follows platform guidance.

JavaScript / TypeScript conventions

- Use `string.replaceAll()` rather than `string.replace()` with a global regex when replacing all occurrences.
- Prefer `for...of` over `Array.prototype.forEach()` for readability and better control (e.g., `break` / `continue`).
- Avoid negated conditions when an `else` branch makes intent clearer.
- Do not nest ternary operators; use `if`/`else` for complex branching.

React-specific

- Treat props as immutable; never mutate props directly inside a component.
- Keep client components small; prefer server components where appropriate.

Readability & complexity

- Keep function cognitive complexity low: split large functions into smaller helpers.
- Avoid deep function nesting; prefer flat, testable helpers.

Testing & verification

- Test changes in relevant environments and run the project's linters/tests before committing.

If you need a rule relaxed for a specific case, add a short inline justification comment and mark it for review in the PR description.
