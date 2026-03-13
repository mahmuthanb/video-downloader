# Video Downloader

Lokal çalışan, API anahtarı gerektirmeyen video indirici. Instagram Reels, TikTok ve YouTube Shorts destekler.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Özellikler

- **Çoklu platform** — Instagram Reels/Posts, TikTok videoları, YouTube Shorts
- **Karışık yapıştırma** — Farklı platformlardan linkleri aynı anda yapıştır, her biri otomatik algılanır
- **Platform badge'leri** — Her video satırında hangi platforma ait olduğu görsel olarak gösterilir
- **Canlı progress** — İndirme yüzdesi, hız (MB/s) ve ETA gerçek zamanlı güncellenir
- **SSE mimarisi** — Server-Sent Events ile düşük latency, polling yok
- **Çoklu indirme** — Birden fazla link aynı anda indirilebilir

## Desteklenen Platformlar

| Platform | Örnek URL formatı |
|----------|-------------------|
| Instagram | `instagram.com/reel/...` · `instagram.com/p/...` |
| TikTok | `tiktok.com/@user/video/...` · `vm.tiktok.com/...` |
| YouTube | `youtube.com/shorts/...` · `youtu.be/...` |

## Kurulum

### Gereksinimler

- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- ffmpeg (video+audio birleştirme için)

```bash
# yt-dlp
brew install yt-dlp

# ffmpeg
brew install ffmpeg
```

### Başlatma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresi açılır.

İndirilen videolar proje kök dizinindeki `downloads/` klasörüne kaydedilir.

## Kullanım

1. Bir veya birden fazla video linkini metin kutusuna yapıştır
2. Farklı platformlardan linkler karıştırılabilir
3. **İndir** butonuna tıkla veya `Cmd+Enter` / `Ctrl+Enter`
4. Her video için platform badge'i, progress bar ve hız bilgisi görüntülenir

## CLI Kullanımı

```bash
python3 download.py https://www.instagram.com/reel/xxx
python3 download.py --cookies cookies.txt https://www.instagram.com/reel/yyy
```

Private içerikler için tarayıcı extension'ı ile export edilmiş `cookies.txt` kullanılabilir.

## Teknik Yapı

```
app/
├── page.tsx              # UI — platform detect, badge, progress
├── layout.tsx
└── api/
    └── download/
        └── route.ts      # SSE endpoint — yt-dlp spawn
download.py               # CLI alternatifi
downloads/                # İndirilen videolar (git ignore)
```

Mimari: Next.js App Router + SSE stream. Her indirme talebi için ayrı bir `yt-dlp` process spawn edilir ve stdout/stderr satır satır parse edilerek client'a event olarak iletilir.
