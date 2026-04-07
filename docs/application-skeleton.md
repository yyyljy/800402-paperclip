# Application Skeleton

## Decision

The first executable repository shape is a web-first `pnpm` workspace:

- `apps/web` is the only runnable application today
- `packages/design-tokens` and `packages/ui-primitives` are the next shared code
  boundaries
- `apps/api`, `apps/worker`, and `apps/protocol-adapter` are explicitly reserved
  but not executable yet

This is intentionally not a single flat app and not an early four-service
split. It preserves the long-term runtime boundary while keeping the current
implementation slice aligned with the actual queued work.

## Why This Shape

1. The next assigned tickets are semantic tokens, Layer 1 primitives, and one
   reference screen composition, all of which are browser-first concerns.
2. Protocol payload contracts are already being defined separately in
   [CMP-27](/CMP/issues/CMP-27), so creating a placeholder API or protocol
   service now would add ownership without stable interfaces.
3. The environment contract already reserves `API_*`, `QUEUE_*`, `WALLET_*`,
   `SIGNER_*`, `ERC8004_*`, and `X402_*` namespaces, so later separation does
   not require a workspace reset.

## Repository Layout

```text
apps/
  web/                # active runnable onboarding shell
  api/                # reserved synchronous application boundary
  worker/             # reserved async task boundary
  protocol-adapter/   # reserved signer/payment boundary
packages/
  design-tokens/      # next semantic token package
  ui-primitives/      # next shared component package
```

## Boundary Contract

| Path | Status | Responsibility | Secret posture |
| --- | --- | --- | --- |
| `apps/web` | active | onboarding shell, screen composition, browser-side state, fixture-driven UX work | no signer or treasury-impacting secrets |
| `packages/design-tokens` | queued | semantic token source, generated CSS variables, typed exports | none |
| `packages/ui-primitives` | queued | reusable presentational primitives and responsive shell behavior | none |
| `apps/api` | reserved | validated form submission, orchestration, durable state changes, non-protocol integrations | standard app/service secrets only |
| `apps/worker` | reserved | retries, queue consumption, asynchronous callbacks, non-interactive jobs | queue and job credentials only |
| `apps/protocol-adapter` | reserved | wallet, signer, x402, and settlement integrations | narrowest network and signing-secret access |

## Package Manager And CI Contract

- use `pnpm` workspaces at the repo root
- keep `apps/*` and `packages/*` under one lockfile
- let the baseline CI continue running from the root without another workflow
  rewrite
- keep the root scripts generic so new packages can opt into `build`,
  `typecheck`, and later `lint` or `test` as they land

## Environment And Secret Impact

No additional environment variables or secrets are required for the first
web-only skeleton beyond the current baseline:

- shared runtime variables already present: `APP_ENV`, `PORT`, `BASE_URL`,
  `API_BASE_URL`
- reserved integration namespaces already present for later services:
  `OPENAI_*`, `OBSERVABILITY_*`, `X402_*`, `ERC8004_*`, `DATABASE_*`,
  `REDIS_*`, `QUEUE_*`, `WALLET_*`, `SIGNER_*`

The first new secret request should happen only when a real server-side or
protocol execution path lands, not for the current browser-only skeleton.
