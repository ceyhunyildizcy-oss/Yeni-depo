# anydoc — Doküman → Markdown

`anydoc`, Firecrawl tarafından geliştirilen Rust tabanlı bir doküman dönüştürücüdür. Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV ve metin tabanlı PDF dosyalarını GitHub-Flavored Markdown'a dönüştürür.

> Bu araç bir MCP sunucusu değildir. MCP Starter Kit'in yanında çalışan bir CLI / Agent Skill olarak eklenmiştir.

## Hızlı kullanım

### Linux / macOS

```bash
bash MCP-STARTER-KIT/anydoc.sh rapor.docx -o rapor.md
```

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\MCP-STARTER-KIT\anydoc.ps1 rapor.docx -o rapor.md
```

### Doğrudan npx

```bash
npx -y @firecrawl/anydoc rapor.docx -o rapor.md
```

İlk çalıştırmada `npx` gerekli paketi indirir. Kalıcı global kurulum zorunlu değildir.

## Örnekler

```bash
# Word -> Markdown
bash MCP-STARTER-KIT/anydoc.sh belge.docx -o belge.md

# PowerPoint -> Markdown
bash MCP-STARTER-KIT/anydoc.sh sunum.pptx -o sunum.md

# Excel -> Markdown
bash MCP-STARTER-KIT/anydoc.sh tablo.xlsx -o tablo.md

# PDF -> Markdown
bash MCP-STARTER-KIT/anydoc.sh rapor.pdf -o rapor.md

# Çıktıyı terminale yaz
bash MCP-STARTER-KIT/anydoc.sh belge.docx
```

## Agent Skill olarak ekleme

Uyumlu ajan istemcilerinde anydoc becerisini eklemek için:

```bash
npx skills add firecrawl/anydoc
```

Bu kurulum, ajana karşılaştığı desteklenen dokümanları anydoc CLI ile Markdown'a dönüştürme akışını öğretir.

## Desteklenen başlıca biçimler

- Word: `.doc`, `.docx`, `.docm`
- PowerPoint: `.ppt`, `.pps`, `.pot`, `.pptx`, `.pptm`, `.ppsx`, `.ppsm`
- Excel: `.xls`, `.xlsx`, `.xlsm`, `.xlsb`
- OpenDocument: `.odt`, `.ods`, `.odp`
- RTF: `.rtf`
- EPUB: `.epub`
- CSV: `.csv`
- PDF: `.pdf`

## PDF / OCR sınırı

Yerel anydoc, metin içeren PDF'leri dönüştürebilir. Yalnızca taranmış görüntülerden oluşan PDF'lerde OCR gerekebilir; bu durumda yerel dönüştürme tek başına yeterli değildir.

## Güvenlik ve veri notu

- CLI yerel çalışır; dokümanı dönüştürmek için bir LLM servisine göndermek zorunda değildir.
- `npx` ilk kullanımda paketi indirir; üretim ortamında sürüm sabitlemek daha tekrarlanabilir sonuç verir.
- Güvenilmeyen dokümanları işlerken dosya ayrıştırıcılarının genel riskleri nedeniyle güncel sürüm ve izole çalışma ortamı tercih edin.

## Kaynak

Resmi proje: `firecrawl/anydoc` — MIT lisanslı açık kaynak proje.
