# Onboarding Workspace

Web-first monorepo for the MVP onboarding experience around three setup paths:

- AI agent capability and connection onboarding
- ERC-8004 wallet and signer readiness
- x402 quote and settlement-path setup

This repository currently ships one runnable surface, `apps/web`, plus shared
design-system packages used by that app. `apps/api`, `apps/worker`, and
`apps/protocol-adapter` are reserved boundaries, but they are not executable
services yet.

Verified repository baseline:

- canonical upstream remote: `https://github.com/yyyljy/800402-paperclip.git`
- protected release branch: `main`
- package manager: `pnpm@10.18.3`
- active CI workflows: `.github/workflows/ci.yml` and `.github/workflows/runtime-control-plane.yml`

## Current Scope

Implemented now:

- `apps/web`: React/Vite onboarding shell with shared three-step flows
- `packages/design-tokens`: semantic token source plus generated CSS, JSON, and typed exports
- `packages/ui-primitives`: shared Layer 1 and Layer 2 React primitives for the onboarding shell
- root CI and smoke commands for install, typecheck, test, build, and web smoke coverage
- containerized web runtime that writes `runtime-config.js` at startup from environment variables

Reserved, but not implemented as runtimes yet:

- `apps/api`
- `apps/worker`
- `apps/protocol-adapter`

## Implemented Product Flows

The current web app is a reference onboarding shell, not a full backend-backed
product. The implemented browser flows are:

- `AI agent`: choose agent capabilities, pick a connection method, and review scope
- `ERC-8004`: confirm wallet, chain, and signer readiness before approval
- `x402`: choose a payment path, handle quote freshness, and review settlement setup

Each flow shares the same design-system shell: progress rail, notices, option
cards, review summary, and action footer.

## Tech Stack

- `pnpm` workspace monorepo
- React 19
- TypeScript 5
- Vite 7 for local web development and production builds
- Vitest and Testing Library for the web smoke and component test suite
- Docker plus Nginx for the production web container
- GitHub Actions for repository checks and release promotion
- selected runtime control plane documented for Google Cloud Run, Artifact Registry, Google Secret Manager, and Sentry

## Repository Layout

```text
apps/
  web/                # runnable onboarding shell
  api/                # reserved synchronous application boundary
  worker/             # reserved async task boundary
  protocol-adapter/   # reserved signer and payment boundary
packages/
  design-tokens/      # semantic token source and generators
  ui-primitives/      # shared React primitives and styles
docs/                 # platform, release, design, and onboarding reference docs
scripts/              # CI and release helper scripts
ops/                  # operational scaffolding, including secret manifest examples
```

## Getting Started

The repo-level environment file is `.env.example`. `apps/web` loads environment
values from the workspace root, not from an app-local `.env`.

1. Enable Corepack:

   ```bash
   corepack enable
   ```

2. Install workspace dependencies:

   ```bash
   pnpm install
   ```

3. Start the web app in development:

   ```bash
   pnpm dev
   ```

The dev server uses `PORT` from the root environment contract and defaults to
`3000`.

Useful root commands:

- `pnpm build`: build design tokens, UI primitives, and the web app
- `pnpm typecheck`: run workspace type checks
- `pnpm test`: run workspace tests
- `pnpm smoke:ci`: run the protected web smoke suite
- `pnpm --filter @onboarding/design-tokens generate`: regenerate token artifacts after editing `packages/design-tokens/source.json`
- `pnpm --filter @onboarding/web preview`: preview the built web app locally

## Environment Model

The repository currently uses three environments only:

- `local`
- `staging`
- `production`

Shared variables already defined in `.env.example`:

- `APP_ENV`
- `APP_NAME`
- `LOG_LEVEL`
- `PORT`
- `BASE_URL`
- `API_BASE_URL`

Reserved integration namespaces already documented:

- `OPENAI_*`
- `OBSERVABILITY_*`
- `X402_*`
- `ERC8004_*`
- `DATABASE_*`
- `REDIS_*`
- `QUEUE_*`
- `WALLET_*`
- `SIGNER_*`

Important rules:

- commit only `.env.example`
- do not commit live `.env` files or raw secrets
- the web container reads `APP_ENV`, `BASE_URL`, and `API_BASE_URL` at startup and writes them into `runtime-config.js`
- signing, wallet, settlement, and webhook secrets are reserved for the future `protocol-adapter` runtime, not the web app

## Developer Workflow

The current implementation path is:

1. Update semantic tokens in `packages/design-tokens/source.json` when visual primitives change.
2. Regenerate token artifacts or run `pnpm build`.
3. Update shared primitives in `packages/ui-primitives/src`.
4. Compose or adjust onboarding flow behavior in `apps/web/src/App.tsx`.
5. Verify changes with `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm smoke:ci`.

## Release And Deployment Baseline

Protected release behavior is already scaffolded in the repo:

- CI runs `Repository Baseline` and `Service Checks` on pull requests and on `main`
- `scripts/ci/service-checks.sh` installs dependencies, then runs root typecheck, test, build, and web smoke coverage
- `apps/web/Dockerfile` builds the web bundle and serves it from Nginx on port `8080`
- `.github/workflows/runtime-control-plane.yml` is set up to build one immutable web image, deploy it to `staging`, smoke-check `/` plus `runtime-config.js`, and promote the same digest to `production`

The codebase selects a Google Cloud runtime path, but live cloud resources still
need to be provisioned outside source control before staging and production
deploys can run.

## Git Push Cadence

- push active platform, infrastructure, and reliability work to git at least once per working day
- push at each meaningful checkpoint: before review, QA, or handoff; before stepping away from an active branch for several hours; and at end of day when work remains in flight
- when the shared workspace contains mixed or unowned local changes, move owned work onto the correct branch or worktree before pushing instead of publishing unrelated WIP

## Reference Docs

- `docs/platform-foundation.md`
- `docs/application-skeleton.md`
- `docs/environment-contract.md`
- `docs/secret-manifest.md`
- `docs/release-controls.md`
- `docs/runtime-control-plane.md`
- `docs/design-system-foundation.md`
- `docs/onboarding-screen-compositions.md`
- `docs/onboarding-copy-source-of-truth.md`
- `docs/design-system-engineering-intake.md`
- `docs/mvp-platform-readiness.md`
