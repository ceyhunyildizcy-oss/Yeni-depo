#!/usr/bin/env bash
set -euo pipefail

if ! command -v npx >/dev/null 2>&1; then
  echo "Hata: anydoc için Node.js 20+ ve npx gerekli." >&2
  echo "Node.js kurulumunu doğrulamak için: node --version && npx --version" >&2
  exit 1
fi

exec npx -y @firecrawl/anydoc "$@"
