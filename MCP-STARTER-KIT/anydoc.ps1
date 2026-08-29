$ErrorActionPreference = "Stop"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "anydoc için Node.js 20+ ve npx gerekli. Önce Node.js kurulumunu doğrulayın: node --version; npx --version"
    exit 1
}

& npx -y "@firecrawl/anydoc" @args
exit $LASTEXITCODE
