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
- [ ] Çözünürlük seçeneği — 1080p, 720p, 480p, yalnızca ses (mp3)
- [ ] Format ayarı item bazında ya da global olarak ayarlanabilsin
- [ ] Altyazı indirme (`--write-subs`, dil seçimi)

### UX
- [ ] Dark mode
- [ ] Tarayıcı bildirimi — indirme tamamlanınca Notification API
- [ ] Drag & drop — URL veya dosyayı textarea'ya sürükle-bırak
- [ ] Item sıralama — platforma / duruma / tarihe göre

### İşlevsel
- [ ] Playlist desteği — şu an `--no-playlist`, opsiyonel açılabilsin
- [ ] İndirme hız limiti — ayarlar paneline `--rate-limit` seçeneği
- [ ] Geçmişi export et — CSV / JSON olarak dışa aktar

### Teknik
- [ ] PWA desteği — masaüstüne kurulabilir, manifest + service worker
- [ ] yt-dlp güncelleme butonu — ayarlar panelinden `yt-dlp -U`
