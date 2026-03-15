# Roadmap

## Tamamlananlar

| # | Özellik | Notlar |
|---|---------|--------|
| ✅ | TikTok desteği | URL regex |
| ✅ | YouTube Shorts desteği | URL regex |
| ✅ | Retry butonu | Hatalı indirmeleri tekrar dene |
| ✅ | İndirme geçmişi | localStorage persist |
| ✅ | Bireysel iptal butonu | EventSource close + server abort |
| ✅ | Concurrency limiti | Max 3 eş zamanlı, kalanlar kuyrukta |
| ✅ | Output dizini ayarı | Ayarlar paneli, göreceli/mutlak yol |
| ✅ | Tarayıcıdan indirme | /api/file stream endpoint |
| ✅ | Cookie desteği | Netscape format, upload/delete UI |
| ✅ | Batch import | .txt / .csv dosyasından URL içe aktar |
| ✅ | Hata açıklaması | Rule-based Türkçe hata mesajları |
| ✅ | Thumbnail preview | yt-dlp --dump-json, item kartında göster |
| ✅ | Otomatik tag/kategori | Platform + uploader + süre + metadata, filtreli UI |

---

## Sıradakiler

### Kalite / Format Seçimi
- ✅ Çözünürlük seçeneği — En iyi, 1080p, 720p, 480p, Ses (mp3); input card'da per-item seçim
- ✅ Altyazı indirme — `--write-subs` / `--write-auto-subs`; TR · EN · Otomatik seçimi, SRT formatı, item kartında CC badge

### UX
- ✅ Dark mode — class-based Tailwind v4 toggle, localStorage persist, flash önleme, Moon/Sun butonu
- ✅ Tarayıcı bildirimi — indirme tamamlanınca Notification API, izin yönetimi, status geçiş takibi (useRef Map)
- ✅ Drag & drop — metin/URL ve .txt/.csv dosyası textarea'ya sürükle-bırak, indigo ring highlight
- ✅ Item sıralama — Platform / Durum / Tarih toggle butonları, sortItems pure fn, createdAt timestamp

### İşlevsel
- ✅ Playlist desteği — settings'te toggle, URL'ler bireysel item'lara ayrıştırılır
- ✅ İndirme hız limiti — ayarlar panelinde Gauge ikonlu input, `--rate-limit` yt-dlp argümanı, localStorage persist
- ✅ Geçmişi export et — CSV (virgül escape) / JSON pretty-print, Blob anchor download, YYYY-MM-DD dosya adı

### Teknik
- ✅ PWA desteği — manifest.json, cache-first service worker (/api/* hariç), SW registration inline script, theme-color meta
- ✅ yt-dlp güncelleme butonu — ayarlar panelinden `yt-dlp -U`
