# Codex + Rocket Fuel + OmniRoute

Bu belge, iki opsiyonel entegrasyonu güvenli biçimde kullanmak için hazırlanmıştır:

1. `NulightJens/rocket-fuel-skill` — Claude Code içinde OpenAI Codex'i ikinci ajan / uygulayıcı olarak kullanan üçüncü taraf skill/workflow.
2. `diegosouzapw/OmniRoute` — Codex, Claude Code, Cursor, OpenCode, Cline ve benzeri istemciler için çok sağlayıcılı AI gateway; OpenAI-uyumlu API ile MCP/A2A yetenekleri sunar.

Bu iki proje MCP Starter Kit'in çekirdek sunucularına otomatik olarak eklenmez. İhtiyaç olduğunda ayrı ayrı kurulur ve etkinleştirilir.

## 1. Rocket Fuel Skill

Kaynak depo: `https://github.com/NulightJens/rocket-fuel-skill`

Projenin kendi akışı Claude tarafını planlama/inceleme, Codex tarafını uygulama ve doğrulama rolünde birlikte kullanır. MIT lisanslıdır.

### Gereksinimler

- Claude Code
- OpenAI Codex CLI
- Git

OpenAI'ın güncel resmi Codex CLI kurulum komutu:

```bash
npm i -g @openai/codex
```

Ardından Codex istemcisini açıp ekrandaki ChatGPT oturum açma adımlarını izleyin.

Rocket Fuel'ın resmi kurulum biçimi:

```bash
git clone https://github.com/NulightJens/rocket-fuel-skill.git ~/rocket-fuel-skill
mkdir -p ~/.claude/skills
ln -s ~/rocket-fuel-skill/rocket-fuel ~/.claude/skills/rocket-fuel
```

Claude Code'u yeniden başlattıktan sonra skill kullanılabilir hale gelir.

> Güvenlik: Üçüncü taraf bir agent skill'i dosya, Git ve komut çalıştırma davranışlarını yönlendirebilir. Etkinleştirmeden önce `rocket-fuel/SKILL.md` ve ilişkili dosyaları inceleyin. Var olan proje üzerinde kullanmadan önce temiz bir Git çalışma ağacı ve geri dönüş noktası oluşturun.

## 2. OmniRoute

Kaynak depo: `https://github.com/diegosouzapw/OmniRoute`

OmniRoute; sağlayıcı/model yönlendirme, fallback, OpenAI-uyumlu API ve MCP/A2A özellikleri sunan MIT lisanslı bir AI gateway'dir.

### Çalışma gereksinimi

Güncel `release/v3.8.51` kaynak ağacındaki `package.json` şu Node.js aralığını ister:

- Node `>=22.22.2 <23`, veya
- Node `>=24 <27`

Üretimde, projenin güncel README'sindeki yayımlanmış sürümü ve kurulum yöntemini doğrulayarak sürüm sabitlemek daha güvenlidir.

### MCP erişimi

Güncel kaynak ağacında HTTP MCP route'u bulunur:

```text
http://localhost:20128/api/mcp/stream
```

OmniRoute'u önce kendi resmi kurulum adımlarıyla yerelde çalıştırın; ardından bu endpoint'i destekleyen MCP istemcinize ekleyin. Starter Kit, üçüncü taraf bir gateway'i otomatik başlatmaz ve mevcut `.mcp.json` dosyasını kendiliğinden değiştirmez.

### Codex'i OmniRoute üzerinden kullanma

OmniRoute'un güncel Codex rehberi `~/.codex/config.toml` kullanır. API anahtarını yapılandırma dosyasına gömmek yerine ortam değişkeninde tutun.

Örnek, model adını kendi OmniRoute kurulumunuza göre değiştirin:

```toml
model = "<MODEL_ID>"
model_provider = "omniroute"

[model_providers.omniroute]
name = "OmniRoute"
base_url = "http://localhost:20128/v1"
env_key = "OMNIROUTE_API_KEY"
requires_openai_auth = false
wire_api = "responses"
```

Shell ortamında:

```bash
export OMNIROUTE_API_KEY="<YOUR_KEY>"
```

Anahtarı repoya commit etmeyin. Yerel kurulumunuz kimlik doğrulaması istemese bile yapılandırmayı uzak sunucuya taşımadan önce erişim kontrolü ekleyin.

## Güvenlik

- `20128` portunu kimlik doğrulama olmadan internete açmayın.
- API anahtarlarını `.mcp.json`, `.vscode/mcp*.json`, `config.toml` veya Git geçmişine gömmeyin.
- Uzak gateway erişiminde minimum yetkili/scoped token kullanın.
- Üçüncü taraf agent skill'lerini etkinleştirmeden önce talimat ve scriptlerini inceleyin.
- Sağlayıcıların ücretsiz/abonelik erişimini bir gateway üzerinden kullanmak, ilgili sağlayıcının kullanım şartlarını ortadan kaldırmaz.

## Kaynak doğrulama notu

Bu entegrasyonlar çekirdek MCP sunucularından ayrı tutulur. Böylece Context7, Playwright, Filesystem, Sequential Thinking, Git ve GitHub yapılandırmaları üçüncü taraf gateway veya agent skill değişikliklerinden etkilenmez.
