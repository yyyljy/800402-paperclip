# Environment Contract

This repository starts with three environments only:

- `local`: developer and agent execution with stubbed integrations or test-only credentials
- `staging`: shared integration environment for release validation, AI-agent flows, and ERC-8004/x402 test paths
- `production`: locked environment with manual promotion from a known staging artifact

## Rules

- Commit only `.env.example`; never commit live `.env*` files with secrets.
- Every deployable service must consume `APP_ENV` and emit logs or metrics with the same environment value.
- Secrets are injected by platform-owned runtime configuration, not copied into source control.
- Production credentials must be isolated from web-facing runtimes when they can move funds, sign transactions, or authorize settlement callbacks.

## Shared Variables

All first-party services should reserve the following shared names:

- `APP_ENV`: one of `local`, `staging`, `production`
- `APP_NAME`: stable service or application identifier
- `LOG_LEVEL`: runtime log threshold
- `PORT`: local bind port for HTTP services
- `BASE_URL`: public URL for the current runtime
- `API_BASE_URL`: upstream API URL when the current process is not the API itself

The first browser app maps these shared root names into build-time constants from
the workspace root rather than introducing a parallel `VITE_*` contract. Keep
the shared names canonical unless a toolchain forces a service-local alias.

## Reserved Integration Namespaces

Use prefixes instead of ad hoc variable names so ownership stays obvious:

- `OPENAI_*`: LLM or AI-provider configuration
- `OBSERVABILITY_*`: logging, tracing, and error-tracking configuration
- `X402_*`: x402 payment network configuration
- `ERC8004_*`: ERC-8004 contract, chain, or settlement configuration
- `DATABASE_*`, `REDIS_*`, `QUEUE_*`: stateful infrastructure endpoints
- `WALLET_*`, `SIGNER_*`: key references, wallet addresses, and signer-specific runtime settings

## Ownership Boundary

- Platform Reliability Lead defines environment names, injection patterns, and secret delivery contracts.
- Product Engineering Lead defines which services consume which variables and removes stale requirements.
- Quality Automation Lead owns test-account usage in `local` and `staging`, but not production credentials.

## Promotion Contract

- `local` can use seeded or stub credentials only.
- `staging` mirrors production topology as closely as practical without production secrets.
- `production` promotes the exact artifact validated in `staging`.
