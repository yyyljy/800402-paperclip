#!/usr/bin/env bash

set -euo pipefail

required_files=(
  ".github/workflows/ci.yml"
  ".env.example"
  "docs/environment-contract.md"
  "docs/platform-foundation.md"
  "docs/release-controls.md"
  "docs/secret-manifest.md"
  "ops/secrets/manifest.example.yaml"
  "scripts/ci/run-service-checks.sh"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "Missing required baseline file: ${file}" >&2
    exit 1
  fi
done

grep -q "APP_ENV" .env.example
grep -q "local" docs/environment-contract.md
grep -q "CMP-16" docs/release-controls.md
grep -q "ownerRole" docs/secret-manifest.md

echo "Repository baseline files verified."
