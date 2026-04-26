#!/usr/bin/env bash
# One-command bootstrap for BootLeaf Starter.
#
# Local:   bash scripts/create.sh my-app
# Remote:  bash <(curl -fsSL https://raw.githubusercontent.com/havlli/bootleaf-starter/master/scripts/create.sh) my-app
#          curl -fsSL https://raw.githubusercontent.com/havlli/bootleaf-starter/master/scripts/create.sh | bash -s -- my-app
#
# What it does, in one shot:
#   1. clones bootleaf-starter into <target-dir>
#   2. runs the Node scaffolder (interactive by default, or fully driven by flags)
#   3. installs the root npm runner (so `npm run dev` works immediately)
#   4. prints next steps
#
# All flags after the target dir are forwarded verbatim to scripts/scaffold.mjs.
# Examples:
#   bash scripts/create.sh widget --yes \
#     --group-id com.acme --artifact-id widget --version 1.0.0 \
#     --name "Widget Service" --github-owner acme --github-repo widget
#
#   bash scripts/create.sh ping --yes --template api-only --no-codecov \
#     --group-id com.acme --artifact-id ping --version 1.0.0 \
#     --name "Ping Service" --github-owner acme --github-repo ping
set -euo pipefail

REPO_URL="${BOOTLEAF_REPO_URL:-https://github.com/havlli/bootleaf-starter.git}"
REF="${BOOTLEAF_REF:-master}"

c_blue=$'\033[1;34m'; c_dim=$'\033[2m'; c_red=$'\033[31m'; c_green=$'\033[32m'; c_off=$'\033[0m'
say()  { printf '%s\n' "${c_blue}━━ $* ━━${c_off}"; }
warn() { printf '%s\n' "${c_red}[ERR]${c_off} $*" >&2; }
ok()   { printf '%s\n' "${c_green}[OK]${c_off}  $*"; }

require() {
    command -v "$1" >/dev/null 2>&1 || { warn "missing required tool: $1"; exit 1; }
}
require git
require node
require npm

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
    warn "Node 20+ required (found $(node -v)). Install via mise / nvm and retry."
    exit 1
fi

if [ "${1:-}" = "" ] || [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    cat <<EOF
Usage: bash scripts/create.sh <target-dir> [scaffold flags...]

Clones bootleaf-starter into <target-dir>, runs the scaffolder, installs
the root npm runner, and prints next steps. Any flags after <target-dir>
are forwarded to scripts/scaffold.mjs (try --yes / --template api-only /
--help for the full list).

Env overrides:
  BOOTLEAF_REPO_URL   override clone URL (default: $REPO_URL)
  BOOTLEAF_REF        branch/tag to clone (default: $REF)
EOF
    exit 0
fi

TARGET="$1"; shift
if [ -e "$TARGET" ]; then
    warn "'$TARGET' already exists — refusing to overwrite. Pick another name or remove it."
    exit 1
fi

say "Cloning $REPO_URL@$REF into $TARGET"
git clone --depth=1 --branch "$REF" "$REPO_URL" "$TARGET"
cd "$TARGET"

# Drop the upstream history so the new project gets a fresh log. The scaffolder
# also handles this when --keep-git is NOT passed, but doing it here makes the
# "I cloned and got their commits" surprise impossible.
rm -rf .git

say "Running scaffolder"
# Forward all remaining args; user controls --yes / --template / etc.
node scripts/scaffold.mjs --keep-git "$@"

say "Installing root npm runner (concurrently)"
npm install --silent --no-audit --no-fund

say "git init"
git init -q
git add -A
git commit -q -m "chore: initial scaffold from bootleaf-starter" || true

ok "Project ready at $(pwd)"
cat <<EOF

${c_dim}Next steps:${c_off}
  cd $TARGET
  npm run dev          # Spring + Tailwind + browser-sync in one terminal
  make verify          # full mvnw verify with Jacoco gate
  make up              # docker compose up (app + Caddy)
EOF
