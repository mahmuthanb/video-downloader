# Video Downloader

Lokal çalışan, API anahtarı gerektirmeyen video indirici. Instagram Reels, TikTok ve YouTube Shorts destekler.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Özellikler

- **Çoklu platform** — Instagram Reels/Posts, TikTok videoları, YouTube Shorts
- **Karışık yapıştırma** — Farklı platformlardan linkleri aynı anda yapıştır, her biri otomatik algılanır ve badge ile gösterilir
- **Canlı progress** — İndirme yüzdesi, hız ve ETA gerçek zamanlı; birleştirme aşaması ayrıca gösterilir
- **Concurrency queue** — Aynı anda max 3 indirme, kalanlar otomatik sıraya girer
- **İptal & Retry** — Aktif indirmeyi tek tıkla iptal et; hatalı olanları tekrar dene
- **Tarayıcıdan kaydet** — Tamamlanan videoyu tarayıcıya direkt indir
- **İndirme geçmişi** — Sayfa yenilense de tamamlanan/hatalı indirmeler korunur
- **Batch import** — `.txt` veya `.csv` dosyasından URL'leri içe aktar
- **Cookie desteği** — Netscape formatında `cookies.txt` yükle; özel/giriş gerektiren içerikler için
- **Özelleştirilebilir klasör** — İndirme klasörünü ayarlardan değiştir (göreceli veya mutlak yol)

---

## Desteklenen Platformlar

| Platform | Örnek URL |
|----------|-----------|
| Instagram | `instagram.com/reel/...` · `instagram.com/p/...` · `instagram.com/tv/...` |
| TikTok | `tiktok.com/@user/video/...` · `vm.tiktok.com/...` · `vt.tiktok.com/...` |
| YouTube | `youtube.com/shorts/...` · `youtu.be/...` |

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
git clone https://github.com/your-username/insta-downloader.git
cd insta-downloader
npm install
npm run dev
```

`http://localhost:3000` adresini aç.

---

## Kullanım

### Temel

1. Video linklerini metin kutusuna yapıştır (platformlar karıştırılabilir)
2. **İndir** butonuna tıkla veya `Cmd/Ctrl + Enter`
3. Her video için canlı progress, hız ve ETA izle
4. Tamamlanan videoda **İndir** bağlantısına tıklayarak tarayıcıya kaydet

### Batch Import

Input kartındaki dosya ikonuna tıkla, `.txt` veya `.csv` seç. İçerisindeki URL'ler otomatik ayrıştırılarak metin kutusuna eklenir.

### Ayarlar (⚙)

Header'daki ⚙ ikonuna tıkla:

| Ayar | Açıklama |
|------|----------|
| **İndirme klasörü** | Dosyaların kaydedileceği dizin. Proje köküne göreceli veya mutlak yol. Varsayılan: `downloads/` |
| **Cookie dosyası** | Netscape formatında `cookies.txt` yükle. Tüm indirmelere otomatik uygulanır. |

### Cookie Kurulumu

Tarayıcı extension'ı ([Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) gibi) ile cookie'leri export et, Ayarlar > Cookie dosyası'ndan yükle.

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
├── page.tsx                  # UI — URL detect, platform badge, progress, queue
├── layout.tsx
└── api/
    ├── download/route.ts     # SSE endpoint — yt-dlp spawn + stdout parse
    ├── file/route.ts         # Dosya stream endpoint (tarayıcı indirme)
    └── cookies/route.ts      # Cookie dosyası yönetimi (GET/POST/DELETE)
download.py                   # CLI alternatifi
.cookies/                     # Cookie dosyası (git ignore)
downloads/                    # İndirilen videolar (git ignore)
```

Her indirme için ayrı bir `yt-dlp` process spawn edilir. `stdout/stderr` satır satır parse edilerek SSE stream üzerinden client'a iletilir. Max 3 eş zamanlı indirme; kalanlar `waiting` statüsünde kalır, slot açılınca otomatik başlar.
