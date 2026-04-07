# Onboarding Workspace

This managed workspace now includes the initial application skeleton on top of
the platform baseline.

Current state:

- local git repository initialized on `main`
- no canonical remote repository attached yet
- repository baseline scaffolding for CI, environment contracts, and secrets now lives in this workspace
- `pnpm` workspace root is active
- `apps/web` is the first runnable application surface
- `packages/design-tokens` now exports the semantic token object plus CSS and JSON artifacts
- `packages/ui-primitives` now provides the shared Layer 1 and Layer 2 primitives used by the first onboarding screen
- future `api`, `worker`, and `protocol-adapter` boundaries are reserved in-repo

Primary reference:

- `docs/platform-foundation.md`
- `docs/application-skeleton.md`
- `docs/environment-contract.md`
- `docs/secret-manifest.md`
- `docs/release-controls.md`
- `docs/design-system-foundation.md`
- `docs/onboarding-screen-compositions.md`
- `docs/onboarding-copy-source-of-truth.md`
- `docs/design-system-engineering-intake.md`

Local commands:

- `corepack enable`
- `pnpm install`
- `pnpm --filter @onboarding/design-tokens generate`
- `pnpm dev`

Immediate next step:

- attach or create the canonical remote repository tracked in [CMP-16](/CMP/issues/CMP-16)
- expand the shared primitives into the remaining onboarding flows and protocol-specific cards once payload contracts are stable
- use `docs/onboarding-screen-compositions.md` for screen assembly, `docs/onboarding-copy-source-of-truth.md` for locked first-screen copy, and `docs/design-system-engineering-intake.md` for token and primitive implementation intake
