# Onboarding Workspace

This managed workspace now includes the initial application skeleton on top of
the platform baseline.

Current state:

- local git repository initialized on `main`
- no canonical remote repository attached yet
- repository baseline scaffolding for CI, environment contracts, and secrets now lives in this workspace
- `pnpm` workspace root is active
- `apps/web` is the first runnable application surface
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
- `pnpm dev`

Immediate next step:

- attach or create the canonical remote repository tracked in [CMP-16](/CMP/issues/CMP-16)
- land `packages/design-tokens`, `packages/ui-primitives`, and the first reference onboarding screen against the skeleton now present here
- use `docs/onboarding-screen-compositions.md` for screen assembly, `docs/onboarding-copy-source-of-truth.md` for locked first-screen copy, and `docs/design-system-engineering-intake.md` for token and primitive implementation intake
