#!/usr/bin/env bash

set -euo pipefail

has_package_script() {
  local package_path="$1"
  local script_name="$2"

  node -e '
    const fs = require("fs");
    const [packagePath, scriptName] = process.argv.slice(1);

    if (!fs.existsSync(packagePath)) {
      process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const hasScript =
      pkg.scripts &&
      Object.prototype.hasOwnProperty.call(pkg.scripts, scriptName);

    process.exit(hasScript ? 0 : 1);
  ' "${package_path}" "${script_name}"
}

run_root_if_present() {
  local script_name="$1"

  if has_package_script "package.json" "${script_name}"; then
    echo "Running root ${script_name}"
    pnpm run "${script_name}"
  else
    echo "Skipping root ${script_name}; script not defined."
  fi
}

run_web_smoke_if_present() {
  if has_package_script "package.json" "smoke:ci"; then
    echo "Running root smoke:ci"
    pnpm run smoke:ci
    return 0
  fi

  if has_package_script "package.json" "smoke"; then
    echo "Running root smoke"
    pnpm run smoke
    return 0
  fi

  if has_package_script "apps/web/package.json" "smoke:ci"; then
    echo "Running @onboarding/web smoke:ci"
    pnpm --filter @onboarding/web run smoke:ci
    return 0
  fi

  if has_package_script "apps/web/package.json" "smoke"; then
    echo "Running @onboarding/web smoke"
    pnpm --filter @onboarding/web run smoke
    return 0
  fi

  echo "Skipping web smoke; no root or apps/web smoke script is defined yet."
}

echo "Installing workspace dependencies."
pnpm install --frozen-lockfile

run_root_if_present typecheck
run_root_if_present test
run_root_if_present build
run_web_smoke_if_present
