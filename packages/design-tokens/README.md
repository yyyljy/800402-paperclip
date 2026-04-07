# `packages/design-tokens`

Semantic token source of truth for the onboarding workspace.

Current contents:

- `source.json`: canonical authored token source, including the default theme and breakpoints
- `src/index.ts`: generated typed exports and flattened helpers
- `src/tokens.css`: generated runtime CSS custom properties
- `tokens.json`: generated machine-readable flattened token export

Generate artifacts with `pnpm --filter @onboarding/design-tokens generate`.
