#!/usr/bin/env bash
set -euo pipefail

fail=0

echo "MCP Starter Kit önkoşul kontrolü"
echo

if command -v node >/dev/null 2>&1; then
  node_version="$(node --version)"
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
  if [ "$node_major" -ge 20 ]; then
    echo "[OK] Node.js $node_version"
  else
    echo "[HATA] Node.js 20+ gerekli; mevcut: $node_version"
    fail=1
  fi
else
  echo "[HATA] node bulunamadı (Node.js 20+ gerekli)"
  fail=1
fi

if command -v npx >/dev/null 2>&1; then
  echo "[OK] npx $(npx --version)"
else
  echo "[HATA] npx bulunamadı"
  fail=1
fi

if command -v git >/dev/null 2>&1; then
  echo "[OK] $(git --version)"
else
  echo "[UYARI] git bulunamadı"
fi

if command -v uvx >/dev/null 2>&1; then
  echo "[OK] uvx bulundu — Git MCP kullanılabilir"
else
  echo "[OPSİYONEL] uvx bulunamadı — yalnızca Git MCP devre dışı kalır"
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "Temel MCP seti için önkoşullar hazır."
  exit 0
fi

echo "Eksik zorunlu önkoşullar var."
exit 1
