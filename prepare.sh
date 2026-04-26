#!/usr/bin/env bash
# Thin shim — delegates to scripts/scaffold.mjs (Node 20+ required).
# Use the script directly for fine-grained flags:
#   node scripts/scaffold.mjs --help-equivalent (see file header)
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
    echo "[ERR] node 20+ is required but was not found on PATH." >&2
    echo "      Run 'mise install' (recommended) or install Node 20 LTS manually." >&2
    exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "[ERR] node $NODE_MAJOR detected; the scaffolder needs >= 20." >&2
    exit 1
fi

exec node "$(dirname "$0")/scripts/scaffold.mjs" "$@"
