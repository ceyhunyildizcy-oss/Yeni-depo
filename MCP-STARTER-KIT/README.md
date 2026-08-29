# MCP Starter Kit

Bu klasör, depoyu MCP istemcileriyle hemen kullanabilmek için hazırlanmış güvenli ve taşınabilir bir başlangıç setidir.

## Dahil edilen MCP sunucuları

| MCP | Amaç | Gereksinim |
|---|---|---|
| Context7 | Güncel kütüphane/dokümantasyon bağlamı | İnternet; API anahtarı temel kullanım için zorunlu değil |
| Playwright | Tarayıcı otomasyonu ve web testi | Node.js 20+ / `npx` |
| Filesystem | Bu çalışma alanındaki dosyaları okuma/yazma | Node.js 20+ / `npx` |
| Sequential Thinking | Çok adımlı problem çözme aracı | Node.js 20+ / `npx` |
| Git | Repo durumu, diff ve Git işlemleri | `uvx` |
| GitHub | GitHub API araçları | VS Code yapılandırmasında GitHub access token |

## Ek ajan aracı: anydoc

`anydoc`, bir MCP sunucusu değildir; MCP araçlarının yanında kullanılabilen Rust tabanlı bir doküman → Markdown CLI / Agent Skill'dir. Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV ve metin tabanlı PDF dosyalarını Markdown'a çevirmek için eklenmiştir.

Hızlı kullanım:

```bash
bash MCP-STARTER-KIT/anydoc.sh rapor.docx -o rapor.md
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\MCP-STARTER-KIT\anydoc.ps1 rapor.docx -o rapor.md
```

Agent Skill olarak:

```bash
npx skills add firecrawl/anydoc
```

Ayrıntılar: [`ANYDOC.md`](./ANYDOC.md)

## Opsiyonel ajan entegrasyonları

İki ek proje doğrulanmış kaynak olarak eklendi ancak çekirdek MCP yapılandırmasına otomatik bağlanmadı:

| Entegrasyon | Rol | Neden opsiyonel? |
|---|---|---|
| `NulightJens/rocket-fuel-skill` | Claude Code + Codex çoklu-ajan workflow'u | Üçüncü taraf skill; komut/dosya davranışlarını etkileyebilir |
| `diegosouzapw/OmniRoute` | Çok sağlayıcılı AI gateway, OpenAI-uyumlu API, MCP/A2A | Ayrı servis ve sağlayıcı kimlik bilgileri gerektirebilir |

Güvenli kurulum, Codex yapılandırması ve OmniRoute MCP endpoint'i: [`CODEX-OMNIROUTE.md`](./CODEX-OMNIROUTE.md)

## Hızlı başlangıç — VS Code

1. Repoyu klonlayın ve VS Code ile açın.
2. Node.js 20+ kurulu olduğundan emin olun: `node --version`.
3. Git MCP kullanacaksanız `uv`/`uvx` kurun: `uvx --version`.
4. Komut Paleti'nden `MCP: List Servers` çalıştırın.
5. İlk çalıştırmada yalnızca güvendiğiniz MCP sunucularını onaylayın.
6. GitHub MCP'yi başlatırsanız VS Code token ister; token hiçbir dosyaya yazılmaz.
7. Dokümanları Markdown'a dönüştürmek için `anydoc.sh` veya `anydoc.ps1` wrapper'ını kullanabilirsiniz.
8. Rocket Fuel veya OmniRoute gerekiyorsa önce opsiyonel entegrasyon rehberini okuyun; çekirdek MCP seti bunlar olmadan da çalışır.

VS Code yapılandırması: `/.vscode/mcp.json`

## Taşınabilir yapılandırma

Repo kökündeki `/.mcp.json`, `mcpServers` biçimini destekleyen MCP istemcileri için hazırlanmıştır. Context7, Playwright, Filesystem, Sequential Thinking ve Git sunucularını içerir.

GitHub sunucusu taşınabilir dosyaya bilerek eklenmemiştir; kimlik doğrulama yöntemleri istemciye göre değişir ve erişim anahtarlarının repoya yazılması güvenli değildir.

Rocket Fuel ve OmniRoute da taşınabilir `.mcp.json` içine otomatik eklenmez. Böylece üçüncü taraf skill/gateway seçimi kullanıcı kontrolünde kalır.

## Güvenlik notları

- `filesystem` yalnızca bu repo/çalışma alanı ile sınırlandırılmıştır.
- GitHub token, API anahtarı veya başka sırları JSON/TOML dosyalarına yazmayın.
- MCP sunucuları yerel makinede komut çalıştırabilir; yalnızca resmi veya doğruladığınız yayıncıları kullanın.
- Tarayıcı otomasyonunda oturum/cookie verilerinin hassas olabileceğini unutmayın.
- GitHub token kullanıyorsanız gereken en düşük yetki kapsamını verin.
- Güvenilmeyen dokümanları anydoc ile işlerken güncel sürüm ve izole çalışma ortamı tercih edin.
- Üçüncü taraf agent skill'lerini çalıştırmadan önce talimat ve scriptlerini inceleyin.
- Yerel gateway portlarını kimlik doğrulama olmadan internete açmayın.

## Kontrol

Linux/macOS:

```bash
bash MCP-STARTER-KIT/check-prereqs.sh
```

Kontrol betiği yalnızca yerel önkoşulları denetler; token okumaz ve ağ üzerinde işlem yapmaz.

## Sorun giderme

- `npx: command not found`: Node.js 20+ kurun.
- `uvx: command not found`: Git MCP'yi geçici olarak devre dışı bırakın veya `uv` kurun.
- Playwright ilk kullanımda gerekli tarayıcı bileşenlerini indirebilir.
- Context7 anahtarsız temel kullanımda oran sınırına takılırsa API anahtarı ekleyebilirsiniz.
- GitHub MCP 401/403 verirse token kapsamını ve repo erişimini kontrol edin.
- anydoc taranmış/görüntü tabanlı PDF'lerde OCR olmadan içerik çıkaramayabilir; metin tabanlı PDF kullanın veya ayrı OCR akışı ekleyin.
- OmniRoute/Codex için güncel model ID'lerini OmniRoute'un kendi dokümantasyonundan doğrulayın; model adlarını bu repoda sabitlemeyin.

## Neden bu set?

Set; kod yazma, güncel dokümantasyon bulma, dosya/Git işlemleri, tarayıcı otomasyonu ve GitHub entegrasyonunu kapsarken mümkün olduğunca az ek bağımlılık ve sıfır hard-coded secret hedefler. anydoc belge → Markdown katmanı ekler; Rocket Fuel ve OmniRoute ise isteyen kullanıcılar için çoklu-ajan ve gateway seçenekleri sağlar.
