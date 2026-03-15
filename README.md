# VaultDL

**Your personal media vault.** Self-hosted video downloader for Instagram, TikTok and YouTube — no ads, no tracking, no watermark, no account required.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

> ⚡ Runs entirely on your machine. Your downloads never touch a third-party server.

---

<!-- Screenshot -->
![VaultDL Screenshot](docs/screenshot.png)

---

## Why VaultDL?

Every other video downloader is either covered in fake download buttons, injecting ads, or gets shut down every few months. VaultDL runs **locally on your machine** — no server, no data collection, no ads, ever.

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 🎯 | **Multi-platform** | Instagram Reels/Posts, TikTok, YouTube Shorts, videos & playlists |
| 🎬 | **Format & quality** | Best · 1080p · 720p · 480p · Audio only (MP3) |
| 📝 | **Subtitle download** | TR · EN · Auto-generated, saved as SRT alongside the video |
| 📊 | **Live progress** | Real-time percentage, speed and ETA per download |
| ⚡ | **Concurrent queue** | Up to 3 simultaneous downloads; extras queue automatically |
| 🌙 | **Dark mode** | System preference detected, manually toggleable, persisted |
| 🔔 | **Browser notifications** | Get notified when a download completes |
| 🖱️ | **Drag & drop** | Drop URLs or .txt/.csv files directly onto the input area |
| 🔃 | **Sorting** | Sort by platform, status or date |
| 📂 | **Playlist support** | Auto-expand playlists into individual items |
| ✋ | **Cancel & Retry** | Cancel active downloads, retry failed ones |
| 💾 | **Browser save** | Download completed videos directly to your browser |
| 🏷️ | **Auto tags & filter** | Tags generated from platform, uploader, duration and metadata |
| 🗂️ | **Batch import** | Import URLs from `.txt` or `.csv` files |
| 🍪 | **Cookie support** | Upload `cookies.txt` for private or age-restricted content |
| 📁 | **Custom output folder** | Set any local path from the settings panel |
| 🚦 | **Rate limiting** | Optionally cap download speed (e.g. `500K`, `2M`) |
| 📤 | **History export** | Export download history as CSV or JSON |
| 🔄 | **yt-dlp updater** | Update yt-dlp from the settings panel with one click |
| 📱 | **PWA** | Install to your desktop, works offline |

---

## Supported Platforms

| Platform | Supported URLs |
|----------|---------------|
| Instagram | `instagram.com/reel/` · `instagram.com/p/` · `instagram.com/tv/` |
| TikTok | `tiktok.com/@user/video/` · `vm.tiktok.com/` · `vt.tiktok.com/` |
| YouTube | `youtube.com/shorts/` · `youtube.com/watch` · `youtube.com/playlist` · `youtu.be/` |

---

## Requirements

- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- ffmpeg

```bash
# macOS
brew install yt-dlp ffmpeg

# Linux
sudo apt install ffmpeg
pip install yt-dlp
```

---

## Quick Start

```bash
git clone https://github.com/your-username/vaultdl.git
cd vaultdl
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

### Basic
1. Paste video URLs into the input box (multiple platforms can be mixed)
2. Select quality: **Best · 1080p · 720p · 480p · Audio**
3. Optionally select subtitles: **TR · EN · Auto**
4. Hit **Download** or press `Cmd/Ctrl + Enter`
5. Watch live progress, speed and ETA for each item
6. Click **Download** on completed items to save to your browser

### Playlist
1. Open Settings (⚙) → enable **Playlist mode**
2. Paste a YouTube playlist URL — each video becomes a separate item
3. Downloads join the normal queue

### Batch Import
Click the file icon in the input card and select a `.txt` or `.csv` file. All URLs are parsed and added automatically. You can also **drag & drop** the file directly onto the input area.

### Settings

| Setting | Description |
|---------|-------------|
| **Output folder** | Local path for saved videos. Relative (from project root) or absolute. Default: `downloads/` |
| **Cookie file** | Upload a Netscape-format `cookies.txt` for private or login-required content |
| **Playlist mode** | Auto-expand playlist URLs into individual video items |
| **Rate limit** | Cap download speed — e.g. `500K`, `2M`. Leave blank for maximum speed |
| **yt-dlp update** | Run `yt-dlp -U` directly from the UI |
| **Export history** | Download your history as CSV or JSON |

### Cookie Setup

Export cookies using a browser extension like [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc), then upload via Settings → Cookie file.

---

## Architecture

```
app/
├── page.tsx                  # Main UI
├── layout.tsx                # Root layout + PWA + dark mode flash prevention
├── ThemeProvider.tsx         # Dark mode context
└── api/
    ├── download/route.ts     # SSE endpoint — yt-dlp spawn, stdout parse, progress stream
    ├── playlist/route.ts     # Playlist expansion — --flat-playlist --dump-single-json
    ├── update-ytdlp/route.ts # yt-dlp -U endpoint
    ├── file/route.ts         # File stream endpoint for browser download
    ├── meta/route.ts         # Metadata fetch — thumbnail, title, tags
    └── cookies/route.ts      # Cookie file management (GET/POST/DELETE)
public/
    ├── manifest.json         # PWA manifest
    └── sw.js                 # Service worker (cache-first, API routes excluded)
download.py                   # CLI alternative
```

Each download spawns a dedicated `yt-dlp` process. `stdout/stderr` is parsed line-by-line and streamed to the client via Server-Sent Events. Max 3 concurrent downloads — extras stay in `waiting` state and start automatically when a slot opens.

---

## CLI

```bash
python3 download.py https://www.instagram.com/reel/xxx
python3 download.py --cookies cookies.txt https://www.tiktok.com/@user/video/yyy
```

---

## License

MIT
