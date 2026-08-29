# Codex + Rocket Fuel + OmniRoute

Bu belge, iki opsiyonel entegrasyonu güvenli ve tekrar üretilebilir biçimde kullanmak için hazırlanmıştır:

1. `NulightJens/rocket-fuel-skill` — Claude Code içinde Codex'i ikinci ajan / uygulayıcı olarak kullanan üçüncü taraf skill.
2. `diegosouzapw/OmniRoute` — Codex, Claude Code, Cursor ve diğer istemciler için AI gateway, model yönlendirme ve MCP/A2A katmanı.

Bu iki araç MCP Starter Kit'in çekirdek sunucularına zorla eklenmez. İhtiyaç olduğunda ayrı ayrı etkinleştirilir.

## 1. Rocket Fuel Skill

Resmi depo: `https://github.com/NulightJens/rocket-fuel-skill`

Amaç: Claude Code'u planlama / inceleme tarafında, OpenAI Codex'i ise uygulama ve doğrulama tarafında birlikte kullanmak.

Gereksinimler:

- Claude Code
- OpenAI Codex CLI
- Git

Codex kurulumu:

```bash
npm install -g @openai/codex@latest
codex login
```

Linux/macOS için bu repodaki kurucu:

```bash
bash MCP-STARTER-KIT/install-rocket-fuel.sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\MCP-STARTER-KIT\install-rocket-fuel.ps1
```

Kurucu, üçüncü taraf depoyu kullanıcı veri klasörüne klonlar ve `rocket-fuel` skill'ini `~/.claude/skills/rocket-fuel` konumuna bağlar/kopyalar. Var olan gerçek bir klasörü sessizce ezmez.

> Güvenlik: Bu skill dosya, Git ve ajan komutlarıyla çalışabilir. Etkinleştirmeden önce `SKILL.md` ve ilgili komutları inceleyin. Üçüncü taraf talimatlarını körü körüne güvenilir kabul etmeyin.

## 2. OmniRoute

Resmi depo: `https://github.com/diegosouzapw/OmniRoute`

OmniRoute; OpenAI-uyumlu bir gateway, sağlayıcı/model yönlendirme katmanı, fallback sistemi ve MCP/A2A sunucusu sağlar.

### Çalıştırma

OmniRoute'un yayınlanmış npm sürümü için Node.js güvenli çalışma aralığı:

- Node `22.22.2+` (22.x), veya
- Node `24.x–26.x`

Node 24 LTS önerilir.

Linux/macOS:

```bash
bash MCP-STARTER-KIT/omniroute-http.sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\MCP-STARTER-KIT\omniroute-http.ps1
```

Bu wrapper'lar yayınlanmış `omniroute@3.8.49` sürümünü normal sunucu modunda başlatır ve MCP stdio yolunu kullanmaz. Varsayılan servis adresi:

```text
http://localhost:20128
```

### VS Code MCP — HTTP transport

Örnek dosya: `/.vscode/mcp.omniroute.example.json`

OmniRoute çalışırken MCP istemcisinde şu endpoint kullanılabilir:

```text
http://localhost:20128/api/mcp/stream
```

Örnek dosya bilerek `.vscode/mcp.json` üzerine otomatik yazılmaz. Önce OmniRoute'u yerelde başlatın, sağlık durumunu kontrol edin, sonra ilgili sunucu bloğunu kendi MCP yapılandırmanıza taşıyın.

### Neden `omniroute --mcp` varsayılan değil?

29 Ağustos 2026 itibarıyla npm `latest` etiketi `3.8.49` sürümünü gösteriyor ve bu yayın için stdio MCP başlangıcında Node tabanlı istemcileri etkileyen açık/raporlanmış bir paketleme hatası bulunuyor. Ana HTTP sunucusu bu hatadan etkilenmiyor. Bu nedenle Starter Kit, daha güvenilir olan HTTP MCP transportunu örnekliyor.

GitHub geliştirme dalı `release/v3.8.51` sürümüne ilerlemiş durumda. npm'de düzeltilmiş yeni sürüm yayımlandığında stdio yolu yeniden değerlendirilebilir.

## Codex'i OmniRoute üzerinden kullanma

OmniRoute'un güncel kaynak ağacı, Codex için `~/.codex/config.toml` tabanlı OpenAI-compatible backend yapılandırmasını belgeliyor. API anahtarını TOML dosyasına gömmek yerine ortam değişkeninde tutun.

Temel yerel endpoint:

```text
http://localhost:20128/v1
```

Önce OmniRoute'u çalıştırıp sağlayıcı/model bağlantılarını doğrulayın; daha sonra Codex provider profilini ekleyin. Model adları ve context limitleri hızlı değişebildiği için sabit model listesi bu repoya kopyalanmamıştır.

## Güvenlik

- `20128` portunu kimlik doğrulama olmadan internete açmayın.
- API anahtarlarını `.mcp.json`, `.vscode/mcp*.json` veya Git'e commit etmeyin.
- Uzak OmniRoute erişiminde scoped token kullanın.
- Üçüncü taraf Claude/Codex skill'lerini etkinleştirmeden önce içeriklerini gözden geçirin.
- Gateway üzerinden ücretsiz/abonelik sağlayıcısı kullanmak, ilgili sağlayıcının kullanım şartlarını ortadan kaldırmaz.
