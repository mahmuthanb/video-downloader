"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Loader2, Download, Link, Trash2, RotateCcw, X } from "lucide-react";

type Status = "waiting" | "downloading" | "done" | "error";
type Platform = "instagram" | "tiktok" | "youtube";

interface DownloadItem {
  id: string;
  url: string;
  platform: Platform;
  status: Status;
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  error?: string;
}

const PLATFORM_PATTERNS: { platform: Platform; regex: RegExp }[] = [
  {
    platform: "instagram",
    regex: /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[^\s"'<>\n]+/g,
  },
  {
    platform: "tiktok",
    regex: /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s"'<>\n]+/g,
  },
  {
    platform: "youtube",
    regex: /https?:\/\/(?:www\.)?(?:youtube\.com\/shorts\/|youtu\.be\/)[^\s"'<>\n]+/g,
  },
];

interface DetectedUrl {
  url: string;
  platform: Platform;
}

function extractUrls(text: string): DetectedUrl[] {
  const seen = new Set<string>();
  const results: DetectedUrl[] = [];

  for (const { platform, regex } of PLATFORM_PATTERNS) {
    const matches = text.match(new RegExp(regex.source, "g")) ?? [];
    for (const url of matches) {
      if (!seen.has(url)) {
        seen.add(url);
        results.push({ url, platform });
      }
    }
  }

  return results;
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return u.hostname.replace("www.", "") + path;
  } catch {
    return url.slice(0, 50);
  }
}

const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; badge: string; dot: string; bar: string; spinner: string }
> = {
  instagram: {
    label: "Instagram",
    badge: "bg-pink-50 text-pink-600 border border-pink-200",
    dot: "border-pink-300",
    bar: "bg-gradient-to-r from-pink-500 to-purple-500",
    spinner: "text-pink-500",
  },
  tiktok: {
    label: "TikTok",
    badge: "bg-gray-900 text-white border border-gray-700",
    dot: "border-gray-400",
    bar: "bg-gradient-to-r from-gray-800 to-cyan-500",
    spinner: "text-cyan-500",
  },
  youtube: {
    label: "Shorts",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot: "border-red-300",
    bar: "bg-red-500",
    spinner: "text-red-500",
  },
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0 ${cfg.badge}`}
    >
      <PlatformIcon platform={platform} size={10} />
      {cfg.label}
    </span>
  );
}

function PlatformIcon({ platform, size = 14 }: { platform: Platform; size?: number }) {
  if (platform === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (platform === "tiktok") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
      </svg>
    );
  }
  // YouTube
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function StatusIcon({ status, platform }: { status: Status; platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform];
  if (status === "done")
    return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (status === "error")
    return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
  if (status === "downloading")
    return <Loader2 className={`w-4 h-4 shrink-0 animate-spin ${cfg.spinner}`} />;
  return <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${cfg.dot}`} />;
}

function ProgressBar({ progress, status, platform }: { progress: number; status: Status; platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform];
  const color =
    status === "done"
      ? "bg-emerald-500"
      : status === "error"
      ? "bg-red-400"
      : cfg.bar;

  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

const MAX_CONCURRENT = 3;

export default function Home() {
  const [input, setInput] = useState("");
  const esRefs = useRef<Map<string, EventSource>>(new Map());
  const [items, setItems] = useState<DownloadItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vd_items");
      if (!stored) return [];
      const parsed: DownloadItem[] = JSON.parse(stored);
      // Stale downloading/waiting items from a previous session → mark as error
      return parsed.map((item) =>
        item.status === "downloading" || item.status === "waiting"
          ? { ...item, status: "error", error: "Sayfa yenilendi, tekrar dene" }
          : item
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const persistable = items.filter(
      (d) => d.status === "done" || d.status === "error"
    );
    localStorage.setItem("vd_items", JSON.stringify(persistable));
  }, [items]);

  const detected = extractUrls(input);
  const foundCount = detected.length;

  const platformCounts = detected.reduce(
    (acc, { platform }) => ({ ...acc, [platform]: (acc[platform] ?? 0) + 1 }),
    {} as Partial<Record<Platform, number>>
  );

  const update = useCallback((id: string, patch: Partial<DownloadItem>) => {
    setItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }, []);

  const startDownload = useCallback(
    (item: DownloadItem) => {
      const es = new EventSource(
        `/api/download?url=${encodeURIComponent(item.url)}`
      );
      esRefs.current.set(item.id, es);

      const cleanup = () => {
        es.close();
        esRefs.current.delete(item.id);
      };

      es.addEventListener("progress", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        update(item.id, { status: "downloading", ...data });
      });

      es.addEventListener("done", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        update(item.id, { status: "done", progress: 100, ...data });
        cleanup();
      });

      es.addEventListener("error", (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          update(item.id, { status: "error", error: data.error });
        } catch {
          update(item.id, { status: "error", error: "Bağlantı hatası" });
        }
        cleanup();
      });
    },
    [update]
  );

  const cancelItem = useCallback(
    (item: DownloadItem) => {
      const es = esRefs.current.get(item.id);
      if (es) {
        es.close();
        esRefs.current.delete(item.id);
      }
      update(item.id, { status: "error", error: "İptal edildi", speed: undefined, eta: undefined });
    },
    [update]
  );

  // Queue processor: start waiting items up to MAX_CONCURRENT
  useEffect(() => {
    const activeCount = items.filter((d) => d.status === "downloading").length;
    const slots = MAX_CONCURRENT - activeCount;
    if (slots <= 0) return;
    const pending = items.filter(
      (d) => d.status === "waiting" && !esRefs.current.has(d.id)
    );
    pending.slice(0, slots).forEach(startDownload);
  }, [items, startDownload]);

  const handleAdd = () => {
    if (detected.length === 0) return;

    const existingUrls = new Set(items.map((d) => d.url));
    const newItems: DownloadItem[] = detected
      .filter(({ url }) => !existingUrls.has(url))
      .map(({ url, platform }) => ({
        id: crypto.randomUUID(),
        url,
        platform,
        status: "waiting",
        progress: 0,
      }));

    if (newItems.length === 0) return;

    setItems((prev) => [...prev, ...newItems]);
    setInput("");
    // Queue processor useEffect handles starting downloads
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAdd();
  };

  const retryItem = useCallback(
    (item: DownloadItem) => {
      update(item.id, { status: "waiting", progress: 0, error: undefined, speed: undefined, eta: undefined, filename: undefined });
      // Queue processor useEffect handles starting
    },
    [update]
  );

  const clearDone = () => {
    setItems((prev) =>
      prev.filter((d) => d.status !== "done" && d.status !== "error")
    );
    localStorage.removeItem("vd_items");
  };

  const hasClearable = items.some(
    (d) => d.status === "done" || d.status === "error"
  );

  const foundSummary = () => {
    if (foundCount === 0) return "Link yapıştır veya yaz";
    const parts: string[] = [];
    if (platformCounts.instagram) parts.push(`${platformCounts.instagram} Instagram`);
    if (platformCounts.tiktok) parts.push(`${platformCounts.tiktok} TikTok`);
    if (platformCounts.youtube) parts.push(`${platformCounts.youtube} YouTube`);
    return parts.join(" · ");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Download className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-800">Video Downloader</h1>
          <div className="flex items-center gap-1 ml-1">
            <PlatformBadge platform="instagram" />
            <PlatformBadge platform="tiktok" />
            <PlatformBadge platform="youtube" />
          </div>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              "Linkleri buraya yapıştır (karışık olabilir)...\nhttps://www.instagram.com/reel/xxx\nhttps://www.tiktok.com/@user/video/yyy\nhttps://youtube.com/shorts/zzz"
            }
            className="w-full h-28 resize-none text-sm text-gray-700 placeholder:text-gray-400 outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Link className="w-3 h-3" />
              {foundSummary()}
            </span>
            <button
              onClick={handleAdd}
              disabled={foundCount === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              İndir {foundCount > 1 ? `(${foundCount})` : ""}
            </button>
          </div>
        </div>

        {/* Download list */}
        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                İndirmeler
              </span>
              {hasClearable && (
                <button
                  onClick={clearDone}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Temizle
                </button>
              )}
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <StatusIcon status={item.status} platform={item.platform} />
                  <PlatformBadge platform={item.platform} />
                  <span className="text-xs text-gray-500 font-mono truncate flex-1">
                    {shortUrl(item.url)}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1.5">
                    {item.status === "waiting" && "Bekliyor"}
                    {item.status === "downloading" && `${item.progress.toFixed(0)}%`}
                    {item.status === "done" && "Tamamlandı"}
                    {item.status === "error" && "Hata"}
                    {(item.status === "waiting" || item.status === "downloading") && (
                      <button
                        onClick={() => cancelItem(item)}
                        title="İptal et"
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                </div>

                {(item.status === "downloading" || item.status === "done") && (
                  <ProgressBar progress={item.progress} status={item.status} platform={item.platform} />
                )}

                {item.status === "downloading" && (item.speed || item.eta) && (
                  <div className="flex gap-3 text-xs text-gray-400">
                    {item.speed && <span>{item.speed}</span>}
                    {item.eta && item.eta !== "merging..." && (
                      <span>ETA {item.eta}</span>
                    )}
                    {item.eta === "merging..." && (
                      <span className="text-indigo-400">Birleştiriliyor...</span>
                    )}
                  </div>
                )}

                {item.status === "done" && item.filename && (
                  <p className="text-xs text-emerald-600 font-mono truncate">
                    {item.filename}
                  </p>
                )}

                {item.status === "error" && (
                  <div className="flex items-center justify-between gap-2">
                    {item.error && (
                      <p className="text-xs text-red-400 truncate">{item.error}</p>
                    )}
                    <button
                      onClick={() => retryItem(item)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors shrink-0 ml-auto"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Tekrar dene
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Videolar{" "}
          <code className="bg-gray-100 px-1 rounded">downloads/</code>{" "}
          klasörüne kaydedilir
        </p>
      </div>
    </main>
  );
}
