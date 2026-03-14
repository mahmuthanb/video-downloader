# Video Downloader

Lokal çalışan, API anahtarı gerektirmeyen video indirici. Instagram Reels, TikTok ve YouTube (Shorts + playlist) destekler.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

<!-- Screenshot -->
> **Not:** Aşağıya uygulama ekran görüntüsü eklenecek.
>
> ![screenshot](docs/screenshot.png)

---

## Özellikler

| | Özellik | Açıklama |
|---|---------|----------|
| 🎯 | **Çoklu platform** | Instagram Reels/Posts, TikTok videoları, YouTube Shorts & playlist |
| 📋 | **Karışık yapıştırma** | Farklı platformlardan linkleri aynı anda yapıştır; her biri otomatik algılanır |
| 📊 | **Canlı progress** | İndirme yüzdesi, hız ve ETA gerçek zamanlı; birleştirme/dönüştürme aşaması ayrıca gösterilir |
| 🎬 | **Format & kalite seçimi** | En iyi · 1080p · 720p · 480p · Yalnızca ses (MP3); URL eklerken seçilir |
| 📂 | **Playlist desteği** | Playlist URL'lerini bireysel videolara otomatik ayrıştırır, her biri ayrı item olarak eklenir |
| ⚡ | **Concurrency queue** | Aynı anda max 3 indirme; kalanlar otomatik sıraya girer |
| ✋ | **İptal & Retry** | Aktif indirmeyi tek tıkla iptal et; hatalıları yeniden dene |
| 💾 | **Tarayıcıdan kaydet** | Tamamlanan videoyu tarayıcıya direkt indir |
| 🏷️ | **Otomatik tag & filtre** | Platform, yükleyici, süre ve metadata'dan otomatik tag üretilir; tag'e tıklayarak filtrele |
| 🗂️ | **Batch import** | `.txt` veya `.csv` dosyasından URL'leri toplu içe aktar |
| 🍪 | **Cookie desteği** | Netscape formatında `cookies.txt` yükle; özel/giriş gerektiren içerikler için |
| 📁 | **Özelleştirilebilir klasör** | İndirme klasörünü ayarlardan değiştir (göreceli veya mutlak yol) |
| 🔄 | **yt-dlp güncelleme** | Ayarlar panelinden `yt-dlp -U` çalıştır, tek tıkla güncel tut |
| 📜 | **İndirme geçmişi** | Sayfa yenilense de tamamlanan/hatalı indirmeler localStorage'da korunur |

---

## Desteklenen Platformlar

| Platform | Örnek URL |
|----------|-----------|
| Instagram | `instagram.com/reel/...` · `instagram.com/p/...` · `instagram.com/tv/...` |
| TikTok | `tiktok.com/@user/video/...` · `vm.tiktok.com/...` · `vt.tiktok.com/...` |
| YouTube | `youtube.com/shorts/...` · `youtube.com/watch?v=...` · `youtube.com/playlist?list=...` · `youtu.be/...` |

---

## Gereksinimler

- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- ffmpeg (video+audio birleştirme için)

```bash
brew install yt-dlp ffmpeg
```

---

## Kurulum

```bash
git clone https://github.com/your-username/video-downloader.git
cd video-downloader
npm install
npm run dev
```

`http://localhost:3000` adresini aç.

---

## Kullanım

### Temel

1. Video linklerini metin kutusuna yapıştır (platformlar karıştırılabilir)
2. Kalite/format seç: **En iyi · 1080p · 720p · 480p · Ses**
3. **İndir** butonuna tıkla veya `Cmd/Ctrl + Enter`
4. Her video için canlı progress, hız ve ETA izle
5. Tamamlanan videoda **İndir** bağlantısına tıklayarak tarayıcıya kaydet

### Playlist

1. Ayarlar (⚙) > **Playlist modu** toggle'ını aç
2. YouTube playlist URL'sini yapıştır → her video otomatik olarak ayrı bir item'a dönüşür
3. İndirmeler normal queue'ya girer, aynı concurrency kuralları geçerlidir

### Batch Import

Input kartındaki dosya ikonuna tıkla, `.txt` veya `.csv` seç. İçerisindeki URL'ler otomatik ayrıştırılarak metin kutusuna eklenir.

### Ayarlar (⚙)

| Ayar | Açıklama |
|------|----------|
| **İndirme klasörü** | Dosyaların kaydedileceği dizin. Proje köküne göreceli veya mutlak yol. Varsayılan: `downloads/` |
| **Cookie dosyası** | Netscape formatında `cookies.txt` yükle. Tüm indirmelere otomatik uygulanır. |
| **Playlist modu** | Açıkken URL'ler bireysel videolara ayrıştırılır. |
| **yt-dlp güncelle** | `yt-dlp -U` çalıştırır, sonuç mesajını gösterir. |

### Cookie Kurulumu

Tarayıcı eklentisi ([Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) gibi) ile cookie'leri export et, Ayarlar > Cookie dosyası'ndan yükle.

---

## CLI

```bash
python3 download.py https://www.instagram.com/reel/xxx
python3 download.py --cookies cookies.txt https://www.tiktok.com/@user/video/yyy
```

---

## Teknik Yapı

```
app/
├── page.tsx                      # UI — URL detect, format seçimi, platform badge, progress, queue
├── layout.tsx
└── api/
    ├── download/route.ts         # SSE endpoint — yt-dlp spawn + stdout parse
    ├── playlist/route.ts         # Playlist ayrıştırma — --flat-playlist --dump-single-json
    ├── update-ytdlp/route.ts     # yt-dlp -U endpoint
    ├── file/route.ts             # Dosya stream endpoint (tarayıcı indirme)
    ├── meta/route.ts             # Metadata endpoint — thumbnail, title, tags
    └── cookies/route.ts          # Cookie dosyası yönetimi (GET/POST/DELETE)
download.py                       # CLI alternatifi
.cookies/                         # Cookie dosyası (git ignore)
downloads/                        # İndirilen videolar (git ignore)
```

Her indirme için ayrı bir `yt-dlp` process spawn edilir. `stdout/stderr` satır satır parse edilerek SSE stream üzerinden client'a iletilir. Max 3 eş zamanlı indirme; kalanlar `waiting` statüsünde kalır, slot açılınca otomatik başlar.
