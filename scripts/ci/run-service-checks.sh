#!/usr/bin/env bash

set -euo pipefail

if [[ -x "scripts/ci/service-checks.sh" ]]; then
  echo "Running repository-specific service checks."
  bash scripts/ci/service-checks.sh
  exit 0
fi

if [[ ! -f "package.json" ]]; then
  echo "No root package.json or scripts/ci/service-checks.sh override found yet; skipping service checks."
  exit 0
fi

if [[ -f "pnpm-lock.yaml" ]]; then
  install_cmd=(pnpm install --frozen-lockfile)
  run_cmd=(pnpm)
elif [[ -f "yarn.lock" ]]; then
  install_cmd=(yarn install --immutable)
  run_cmd=(yarn)
elif [[ -f "package-lock.json" ]]; then
  install_cmd=(npm ci)
  run_cmd=(npm run)
else
  echo "Root package.json exists, but no supported lockfile was found." >&2
  exit 1
fi

echo "Installing root dependencies with: ${install_cmd[*]}"
"${install_cmd[@]}"

has_script() {
  local script_name="$1"
  node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    process.exit(pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, process.argv[1]) ? 0 : 1);
  ' "${script_name}"
}

run_if_present() {
  local script_name="$1"

  if has_script "${script_name}"; then
    echo "Running ${script_name}"
    "${run_cmd[@]}" "${script_name}"
  else
    echo "Skipping ${script_name}; script not defined."
  fi
}

run_if_present lint
run_if_present typecheck
run_if_present test
run_if_present build
