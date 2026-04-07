# Secret Manifest Scaffold

The committed secret manifest is a catalog, not a vault. It exists so platform, product, and QA can agree on ownership before runtime credentials are provisioned.

Reference template: `ops/secrets/manifest.example.yaml`

## Manifest Fields

Each secret entry should declare:

- `name`: stable environment-variable or secret-manager key name
- `ownerRole`: the role accountable for storage, rotation, and access policy
- `consumerRoles`: which roles or services are expected to consume the value
- `environments`: which of `local`, `staging`, `production` need the value
- `delivery`: how the value reaches the runtime, such as `runtime_env` or `secret_manager_ref`
- `rotation`: expected rotation cadence or trigger
- `notes`: why the secret exists and any blast-radius constraints

## Ownership Rules

- Platform owns storage, rotation process, and production access policy.
- Product Engineering requests new secrets by updating the manifest and documenting the consuming service.
- QA may request staging-only test credentials but should not own production material.
- Treasury-impacting or signing secrets must be isolated to the narrowest runtime that needs them.

## Initial Classes

Start the first manifest with these classes only:

- AI-provider credentials
- observability ingestion keys
- database and queue connection strings
- wallet or signer references
- x402 or settlement webhook secrets

Avoid creating speculative secrets before a service boundary exists.
