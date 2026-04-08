#!/usr/bin/env bash

set -euo pipefail

base_url="${1:?base url is required}"
expected_app_env="${2:?expected app env is required}"

html_file="$(mktemp)"
config_file="$(mktemp)"
trap 'rm -f "$html_file" "$config_file"' EXIT

curl --fail --silent --show-error --location --retry 3 --retry-delay 2 \
  "${base_url}" > "${html_file}"

grep -q "Onboarding Workspace" "${html_file}"

curl --fail --silent --show-error --location --retry 3 --retry-delay 2 \
  "${base_url%/}/runtime-config.js" > "${config_file}"

grep -q "APP_ENV: \"${expected_app_env}\"" "${config_file}"
