# GitHub Kaynak Haritası

**Belge güncelleme tarihi:** 2026-08-24  
**Kapsam:** Yapay zekâ, ajanlar, Python, veri bilimi, web/mobil geliştirme, güvenlik, oyun, trading/quant ve web/uygulama arayüz tasarımı.  
**GitHub yıldız listelerinin durumu:** 14 liste oluşturuldu. Haritadaki 93 benzersiz kaynak 01–13 numaralı listelerde sınıflandırıldı; küratörlü `14-Trending-Weekly` listesi şu anda boş.

Bu harita 15 konu bölümü içinde 93 benzersiz açık kaynak depo bağlantısı içerir. Belge güncelleme tarihi, her projenin o tarihte yeniden doğrulandığı anlamına gelmez; kullanmadan önce projenin güncel bakım, lisans ve güvenlik durumunu kontrol edin.

## Hızlı gezinme

- **Temel alanlar:** [01 AI/LLM](#01--ai-llm-ve-makine-öğrenmesi) · [02 ajan framework’leri](#02--ajan-frameworkleri) · [03 kodlama/tarayıcı ajanları](#03--kodlama-ve-tarayıcı-ajanları) · [04 Python/veri/API](#04--python-api-ve-veri-bilimi) · [05 web/mobil](#05--web-ve-mobil-geliştirme) · [06 güvenlik/oyun/öğrenme](#06--güvenlik-oyun-ve-temel-öğrenme) · [07 trading/quant](#07--trading-ve-quant)
- **Tasarım ve ürün arayüzü:** [08 prototipleme](#08--tasarım-ve-prototipleme) · [09 headless UI](#09--headless-bileşenler-ve-erişilebilir-ui-temelleri) · [10 görsel sistemler](#10--hazır-görsel-tasarım-sistemleri) · [11 kalite](#11--tasarım-sistemi-mühendisliği-ve-kalite) · [12 ikon/animasyon](#12--ikon-animasyon-ve-mikro-etkileşim) · [13 mobil UI](#13--mobil-uygulama-arayüzleri) · [14 dashboard](#14--dashboard-veri-görselleştirme-ve-trading-arayüzü) · [15 ajan UI](#15--ajan-ve-generative-ui-arayüzleri)
- **Uygulama:** [Hedefe göre teknoloji kombinasyonları](#hedeflere-göre-bağlı-teknoloji-kombinasyonları) · [Oluşturulan yıldız listeleri](#oluşturulan-github-yıldız-listeleri) · [Yıldızlanan başlangıç seçkisi](#yıldızlanan-başlangıç-tasarım-paketi) · [Kullanım, lisans ve güvenlik](#kullanım-lisans-ve-güvenlik-notları)

Bu seçki yalnızca yıldız sayısına göre hazırlanmadı. Ana ölçütler: resmi veya güvenilir proje sahipliği, aktif geliştirme, anlaşılır lisans, dokümantasyon, erişilebilirlik, üretim değeri ve öğrenme faydasıdır.

> GitHub Trending depoları ana listeye otomatik eklenmemeli; lisans, bakım durumu, ana depo olup olmadığı ve güvenlik riski ayrıca kontrol edilmelidir.

---

## Temel kaynaklar

### 01 — AI, LLM ve makine öğrenmesi

| Depo | Kullanım |
|---|---|
| [huggingface/transformers](https://github.com/huggingface/transformers) | Dil, görüntü, ses ve çok modlu modeller |
| [pytorch/pytorch](https://github.com/pytorch/pytorch) | Derin öğrenme ve model eğitimi |
| [rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch) | LLM mimarisini sıfırdan öğrenme |
| [tensorflow/tensorflow](https://github.com/tensorflow/tensorflow) | Makine öğrenmesi ve üretim sistemleri |
| [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) | Başlangıç düzeyi AI müfredatı |

### 02 — Ajan framework’leri

| Depo | Kullanım |
|---|---|
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | Araç, handoff, guardrail, oturum ve tracing destekli Python ajanları |
| [microsoft/agent-framework](https://github.com/microsoft/agent-framework) | Python ve .NET ile üretim düzeyi ajan/workflow altyapısı |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | Uzun süre çalışan, durumlu ve insan onaylı graph tabanlı ajanlar |
| [google/adk-python](https://github.com/google/adk-python) | Google ekosistemi ve çoklu-ajan orkestrasyonu |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | Tip güvenli Python ajanları ve doğrulanmış çıktılar |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | Rol tabanlı çoklu-ajan ekipleri |
| [huggingface/smolagents](https://github.com/huggingface/smolagents) | Az kodla, modelden bağımsız Code Agent geliştirme |
| [livekit/agents](https://github.com/livekit/agents) | Gerçek zamanlı sesli ve çok modlu ajanlar |
| [letta-ai/letta-code](https://github.com/letta-ai/letta-code) | Hafızalı ve uzun süreli çalışan ajanlar |

### 03 — Kodlama ve tarayıcı ajanları

| Depo | Kullanım |
|---|---|
| [openai/codex](https://github.com/openai/codex) | Yerel terminal ve IDE kodlama ajanı |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | Self-hosted kodlama ajanı kontrol merkezi |
| [Aider-AI/aider](https://github.com/Aider-AI/aider) | Git odaklı terminal kodlama asistanı |
| [cline/cline](https://github.com/cline/cline) | VS Code içinde dosya ve terminal kullanan ajan |
| [anomalyco/opencode](https://github.com/anomalyco/opencode) | Açık kaynak terminal kodlama ajanı |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | Web sayfası, form ve tarayıcı otomasyonu |

### 04 — Python, API ve veri bilimi

| Depo | Kullanım |
|---|---|
| [python/cpython](https://github.com/python/cpython) | Python’ın resmi kaynak kodu |
| [vinta/awesome-python](https://github.com/vinta/awesome-python) | Seçilmiş Python araç ve kütüphaneleri |
| [fastapi/fastapi](https://github.com/fastapi/fastapi) | Modern API ve backend geliştirme |
| [pandas-dev/pandas](https://github.com/pandas-dev/pandas) | Tablo ve zaman serisi işlemleri |
| [scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn) | Klasik makine öğrenmesi |
| [streamlit/streamlit](https://github.com/streamlit/streamlit) | Python analizlerini web uygulamasına dönüştürme |
| [apache/airflow](https://github.com/apache/airflow) | Veri iş akışlarını zamanlama ve izleme |
| [public-apis/public-apis](https://github.com/public-apis/public-apis) | Açık API kataloğu |

### 05 — Web ve mobil geliştirme

| Depo | Kullanım |
|---|---|
| [react/react](https://github.com/react/react) | React arayüzleri |
| [vercel/next.js](https://github.com/vercel/next.js) | React tabanlı full-stack web uygulamaları |
| [vuejs/core](https://github.com/vuejs/core) | Vue uygulamaları |
| [sveltejs/svelte](https://github.com/sveltejs/svelte) | Svelte uygulamaları |
| [flutter/flutter](https://github.com/flutter/flutter) | Android, iOS, web ve masaüstü uygulamaları |
| [react/react-native](https://github.com/react/react-native) | React ile Android ve iOS geliştirme |
| [android/nowinandroid](https://github.com/android/nowinandroid) | Kotlin ve Jetpack Compose referans mimarisi |

### 06 — Güvenlik, oyun ve temel öğrenme

| Depo | Kullanım |
|---|---|
| [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | Güvenli yazılım geliştirme rehberleri |
| [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop) | Yasal web güvenliği laboratuvarı |
| [nmap/nmap](https://github.com/nmap/nmap) | Yetkili ağ ve servis envanteri |
| [rapid7/metasploit-framework](https://github.com/rapid7/metasploit-framework) | Kontrollü penetrasyon testi framework’ü |
| [godotengine/godot](https://github.com/godotengine/godot) | Açık kaynak 2D ve 3D oyun motoru |
| [bevyengine/bevy](https://github.com/bevyengine/bevy) | Rust tabanlı oyun motoru |
| [codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) | Teknolojileri sıfırdan geliştirerek öğrenme |
| [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) | Sistem tasarımı |
| [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) | Algoritma ve mülakat hazırlığı |

### 07 — Trading ve quant

| Depo | Kullanım |
|---|---|
| [QuantConnect/Lean](https://github.com/QuantConnect/Lean) | Kapsamlı backtest ve işlem motoru |
| [freqtrade/freqtrade](https://github.com/freqtrade/freqtrade) | Kripto backtest, dry-run ve bot altyapısı |
| [kernc/backtesting.py](https://github.com/kernc/backtesting.py) | Öğrenmesi kolay Python backtest aracı |
| [polakowo/vectorbt](https://github.com/polakowo/vectorbt) | Vektörize strateji ve parametre araştırması |
| [microsoft/qlib](https://github.com/microsoft/qlib) | ML tabanlı quant araştırması |
| [ccxt/ccxt](https://github.com/ccxt/ccxt) | Kripto borsaları için ortak API katmanı |
| [AI4Finance-Foundation/FinRL-Trading](https://github.com/AI4Finance-Foundation/FinRL-Trading) | AI ve reinforcement learning tabanlı trading araştırması |

> Trading projeleri gerçek para öncesinde veri analizi, backtest, forward test ve paper-trading aşamalarından geçmelidir. API anahtarlarında para çekme yetkisi bulunmamalıdır.

---

## Web ve uygulama arayüz tasarımı

### 08 — Tasarım ve prototipleme

| Depo | En uygun kullanım |
|---|---|
| [penpot/penpot](https://github.com/penpot/penpot) | Açık kaynak UI/UX tasarımı, prototip ve ekip çalışması |
| [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) | Wireframe, kullanıcı akışı ve hızlı fikir çizimi |

**Akış:** kullanıcı problemi → kullanıcı akışı → wireframe → Penpot prototipi → design token’ları → Storybook → uygulama.

### 09 — Headless bileşenler ve erişilebilir UI temelleri

| Depo | En uygun kullanım |
|---|---|
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Kaynak koduna sahip olunan, özelleştirilebilir modern React arayüzleri |
| [mui/base-ui](https://github.com/mui/base-ui) | React için stillendirilmemiş ve erişilebilir primitive’ler |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) | React tasarım sistemleri için erişilebilir düşük seviye bileşenler |
| [chakra-ui/ark](https://github.com/chakra-ui/ark) | React, Vue, Solid ve Svelte için headless bileşen yaklaşımı |
| [adobe/react-spectrum](https://github.com/adobe/react-spectrum) | React Aria ve yüksek erişilebilirlik gerektiren ürünler |
| [tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) | React ve Vue için sade erişilebilir bileşenler |

**Kural:** Bir projede tek ana primitive katmanı seç; Base UI, Radix, Ark UI ve React Aria’yı rastgele karıştırma.

### 10 — Hazır görsel tasarım sistemleri

| Depo | En uygun kullanım |
|---|---|
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Tasarım kararlarını utility sınıflarıyla uygulama |
| [mui/material-ui](https://github.com/mui/material-ui) | Kurumsal React uygulamaları ve Material Design |
| [ant-design/ant-design](https://github.com/ant-design/ant-design) | Veri yoğun yönetim ve iş uygulamaları |
| [mantinedev/mantine](https://github.com/mantinedev/mantine) | Geniş bileşen ve hook setiyle hızlı React geliştirme |
| [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui) | Tema odaklı, erişilebilir React uygulamaları |
| [microsoft/fluentui](https://github.com/microsoft/fluentui) | Microsoft tarzı kurumsal ve çok platformlu ürünler |
| [carbon-design-system/carbon](https://github.com/carbon-design-system/carbon) | Büyük kurumsal ve veri yoğun arayüzler |

**Seçim özeti:**

- Özgün SaaS/AI ürünü: `shadcn/ui + Base UI veya Radix UI`
- Kurumsal panel: `MUI`, `Ant Design` veya `Carbon`
- Hızlı React MVP’si: `Mantine`
- Microsoft ekosistemi: `Fluent UI`

### 11 — Tasarım sistemi mühendisliği ve kalite

| Depo | Rol |
|---|---|
| [storybookjs/storybook](https://github.com/storybookjs/storybook) | Bileşenleri bağımsız geliştirme, belgeleme ve test etme |
| [style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary) | Renk, ölçü ve tipografi token’larını platformlara dağıtma |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | Otomatik erişilebilirlik testleri |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Uçtan uca, çok tarayıcılı ve görsel regresyon testleri |

**Kalite kapısı:** Storybook build → axe-core → Playwright → performans kontrolü → insan kod incelemesi.

### 12 — İkon, animasyon ve mikro etkileşim

| Depo | Rol |
|---|---|
| [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | Tutarlı, çok platformlu SVG ikon seti |
| [tabler/tabler-icons](https://github.com/tabler/tabler-icons) | Geniş çizgisel ikon koleksiyonu |
| [motiondivision/motion](https://github.com/motiondivision/motion) | React ve web animasyonları |
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | Vektör animasyonlarını web’de çalıştırma |

### 13 — Mobil uygulama arayüzleri

| Depo | En uygun kullanım |
|---|---|
| [tamagui/tamagui](https://github.com/tamagui/tamagui) | React Native ve web arasında ortak tasarım sistemi |
| [founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables) | React Native için shadcn benzeri bileşenler |
| [nativewind/nativewind](https://github.com/nativewind/nativewind) | React Native’de Tailwind benzeri stil yaklaşımı |
| [callstack/react-native-paper](https://github.com/callstack/react-native-paper) | Material Design tabanlı hazır mobil bileşenler |
| [software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) | Akıcı ve performanslı mobil animasyonlar |
| [gorhom/react-native-bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet) | Üretim kalitesinde bottom sheet ve modal etkileşimleri |

**Mobil kombinasyon:** `Expo/React Native + React Native Reusables veya Tamagui + NativeWind + Reanimated + Bottom Sheet + Lucide`.

### 14 — Dashboard, veri görselleştirme ve trading arayüzü

| Depo | En uygun kullanım |
|---|---|
| [tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts) | Mum, OHLC ve hızlı finansal grafikler |
| [apache/echarts](https://github.com/apache/echarts) | Geniş kapsamlı etkileşimli veri görselleştirme |
| [recharts/recharts](https://github.com/recharts/recharts) | React içinde hızlı iş grafikleri |
| [TanStack/table](https://github.com/TanStack/table) | Headless tablo ve data-grid mantığı |
| [xyflow/xyflow](https://github.com/xyflow/xyflow) | Ajan workflow’u, strateji akışı ve node editörleri |
| [react-grid-layout/react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) | Sürüklenebilir ve yeniden boyutlandırılabilir dashboard |
| [marmelab/react-admin](https://github.com/marmelab/react-admin) | REST/GraphQL tabanlı yönetim uygulamaları |

**Trading terminali:** `Next.js + shadcn/ui + Base UI/Radix + Tailwind CSS + Lightweight Charts + ECharts + TanStack Table + WebSocket + FastAPI`

- Lightweight Charts: fiyat ve mum grafikleri
- ECharts: risk, performans, korelasyon ve portföy analizi
- TanStack Table: emir, işlem, pozisyon ve log tabloları
- React Grid Layout: kullanıcıya özel panel düzeni
- Backtesting.py/LEAN/Freqtrade: araştırma ve paper-trading katmanı

### 15 — Ajan ve Generative UI arayüzleri

| Depo | Rol |
|---|---|
| [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) | Üretim kalitesinde React AI sohbet arayüzleri |
| [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit) | Uygulama içine ajan, copilot ve Generative UI ekleme |
| [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui) | Ajan backend’i ile UI arasında açık olay protokolü |
| [langchain-ai/agent-chat-ui](https://github.com/langchain-ai/agent-chat-ui) | LangGraph için Next.js sohbet arayüzü |
| [pydantic/ai-chat-ui](https://github.com/pydantic/ai-chat-ui) | Pydantic AI tabanlı sohbet UI örneği |
| [agno-agi/agent-ui](https://github.com/agno-agi/agent-ui) | Agno ajanları için hazır arayüz |

**Ajan ürünü:** `Next.js + shadcn/ui + assistant-ui veya CopilotKit + AG-UI + OpenAI Agents SDK/LangGraph/Microsoft Agent Framework + xyflow + Storybook`

---

## Hedeflere göre bağlı teknoloji kombinasyonları

### Modern SaaS veya web uygulaması

`Next.js + TypeScript + Tailwind CSS + shadcn/ui + Base UI/Radix + Storybook + axe-core + Playwright + Lucide + Motion`

### Kurumsal yönetim uygulaması

`React + MUI/Ant Design/Carbon + Storybook + Style Dictionary + TanStack Table + ECharts + Playwright`

### AI ajan uygulaması

`Next.js + assistant-ui/CopilotKit + AG-UI + OpenAI Agents SDK/LangGraph/Microsoft Agent Framework + xyflow + PostgreSQL`

### Trading araştırma paneli

`Next.js + shadcn/ui + Lightweight Charts + ECharts + TanStack Table + FastAPI + pandas + Backtesting.py/LEAN`

### Çapraz platform mobil uygulama

`Expo + React Native + Tamagui veya React Native Reusables + NativeWind + Reanimated + Bottom Sheet`

### Tasarımdan koda geçiş

`Penpot → design token’ları → Style Dictionary → Storybook → web/mobil uygulama → axe-core + Playwright`

---

## Oluşturulan GitHub yıldız listeleri

[Tüm yıldızları ve listeleri aç](https://github.com/stars/ceyhunyildizcy-oss). Liste numaraları, 08’den sonra kaynak haritasındaki bölüm numaralarıyla birebir ilerlemez; yakın tasarım alanları daha kullanışlı bir liste yapısı için birleştirilmiştir.

| Oluşturulan liste | Kaynak haritasındaki karşılığı | Bu belge güncellendiğindeki durum |
|---|---|---|
| [01-AI-LLM](https://github.com/stars/ceyhunyildizcy-oss/lists/01-ai-llm) | Bölüm 01 | 5 depo |
| [02-Agent-Frameworks](https://github.com/stars/ceyhunyildizcy-oss/lists/02-agent-frameworks) | Bölüm 02 | 9 depo |
| [03-Coding-Browser-Agents](https://github.com/stars/ceyhunyildizcy-oss/lists/03-coding-browser-agents) | Bölüm 03 | 6 depo |
| [04-Python-Data-APIs](https://github.com/stars/ceyhunyildizcy-oss/lists/04-python-data-apis) | Bölüm 04 | 8 depo |
| [05-Web-Mobile-Development](https://github.com/stars/ceyhunyildizcy-oss/lists/05-web-mobile-development) | Bölüm 05 | 7 depo |
| [06-Security-Game-Learning](https://github.com/stars/ceyhunyildizcy-oss/lists/06-security-game-learning) | Bölüm 06 | 9 depo |
| [07-Trading-Quant](https://github.com/stars/ceyhunyildizcy-oss/lists/07-trading-quant) | Bölüm 07 | 7 depo |
| [08-Design-Prototyping](https://github.com/stars/ceyhunyildizcy-oss/lists/08-design-prototyping) | Bölüm 08 | 2 depo |
| [09-Web-UI-Systems](https://github.com/stars/ceyhunyildizcy-oss/lists/09-web-ui-systems) | Bölümler 09, 10 ve 12 | 17 depo |
| [10-Mobile-UI](https://github.com/stars/ceyhunyildizcy-oss/lists/10-mobile-ui) | Bölüm 13 | 6 depo |
| [11-Dashboard-Trading-UI](https://github.com/stars/ceyhunyildizcy-oss/lists/11-dashboard-trading-ui) | Bölüm 14 | 7 depo |
| [12-Agent-Generative-UI](https://github.com/stars/ceyhunyildizcy-oss/lists/12-agent-generative-ui) | Bölüm 15 | 6 depo |
| [13-Design-System-Quality](https://github.com/stars/ceyhunyildizcy-oss/lists/13-design-system-quality) | Bölüm 11 | 4 depo |
| [14-Trending-Weekly](https://github.com/stars/ceyhunyildizcy-oss/lists/14-trending-weekly) | Dönemsel, kaynak haritasından bağımsız seçki | Küratörlüdür; şu anda boş |

`14-Trending-Weekly` otomatik doldurulmaz. Bir depo eklenmeden önce lisans, bakım durumu, ana depo olup olmadığı ve güvenlik riski yeniden değerlendirilir.

## Yıldızlanan başlangıç tasarım paketi

Aşağıdaki 22 depo ilk aşamada yıldızlanan tasarım seçkisidir. Sonraki aşamada haritadaki 93 benzersiz kaynağın tamamı 01–13 numaralı listelere dağıtılmıştır; kesin eşleme [`RESOURCES.csv`](./RESOURCES.csv) dosyasındadır.

1. [penpot/penpot](https://github.com/penpot/penpot)
2. [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
3. [mui/base-ui](https://github.com/mui/base-ui)
4. [radix-ui/primitives](https://github.com/radix-ui/primitives)
5. [chakra-ui/ark](https://github.com/chakra-ui/ark)
6. [adobe/react-spectrum](https://github.com/adobe/react-spectrum)
7. [storybookjs/storybook](https://github.com/storybookjs/storybook)
8. [style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary)
9. [dequelabs/axe-core](https://github.com/dequelabs/axe-core)
10. [microsoft/playwright](https://github.com/microsoft/playwright)
11. [lucide-icons/lucide](https://github.com/lucide-icons/lucide)
12. [motiondivision/motion](https://github.com/motiondivision/motion)
13. [tamagui/tamagui](https://github.com/tamagui/tamagui)
14. [founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables)
15. [software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)
16. [tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts)
17. [apache/echarts](https://github.com/apache/echarts)
18. [TanStack/table](https://github.com/TanStack/table)
19. [xyflow/xyflow](https://github.com/xyflow/xyflow)
20. [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui)
21. [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit)
22. [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui)

## Kullanım, lisans ve güvenlik notları

- Bağlı projeler kendi güncel lisans, marka, API, model, veri ve kullanım şartlarına tabidir. Bir projeyi kullanmadan, dağıtmadan veya ticari ürüne eklemeden önce kaynak depodaki şartları ayrıca inceleyin.
- Bir deponun bu haritada listelenmesi veya GitHub’da yıldızlanması; onay, sponsorluk, güvenlik sertifikası ya da sonuç garantisi anlamına gelmez.

### Genel uygulama ve güvenlik kuralları

- Bir üründe tek ana görsel bileşen sistemi ve tek ana headless primitive katmanı kullan.
- Tasarım token’larını kod içine dağınık sabit değerler olarak gömme.
- Erişilebilirlik kontrolünü son aşamaya bırakma; axe-core testlerini CI sürecine ekle.
- Storybook; boş, hata, yükleme, yetkisiz erişim ve uzun içerik durumlarını kapsamalı.
- Playwright ile kritik ekranların masaüstü ve mobil kırılımlarını test et.
- Ajanların dosya silme, mesaj gönderme, ödeme veya canlı işlem açma eylemlerinde insan onayı zorunlu olsun.
- Trading arayüzü ile işlem motorunu ayrı katmanlarda tut; arayüz hatası gerçek emir üretmemeli.
- Terminal veya dosya sistemi kullanan ajanları mümkünse sandbox/Docker içinde çalıştır.
- Trending depolarını lisans, son commit, bakım durumu ve ana depo olup olmadığı açısından doğrula.
