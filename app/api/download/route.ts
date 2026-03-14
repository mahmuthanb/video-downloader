import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { NextRequest } from "next/server";

const COOKIE_PATH = path.join(process.cwd(), ".cookies", "cookies.txt");

const ERROR_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /HTTP Error 403|Forbidden/i, message: "Erişim reddedildi. Cookie dosyası gerekebilir." },
  { pattern: /HTTP Error 404|Not Found/i, message: "Video bulunamadı. Link silinmiş olabilir." },
  { pattern: /HTTP Error 429|rate.?limit/i, message: "İstek limiti aşıldı. Biraz bekleyip tekrar dene." },
  { pattern: /private video/i, message: "Bu video gizli, indirilemez." },
  { pattern: /video is unavailable/i, message: "Video mevcut değil veya kaldırılmış." },
  { pattern: /has been removed/i, message: "Video kaldırılmış." },
  { pattern: /Sign in to confirm your age/i, message: "Yaş doğrulaması gerekiyor. Cookie ekle." },
  { pattern: /This content isn't available/i, message: "İçerik kullanılamıyor." },
  { pattern: /Unsupported URL/i, message: "Bu link desteklenmiyor." },
  { pattern: /Unable to extract/i, message: "Video bilgisi alınamadı. Link geçerli mi?" },
  { pattern: /No video formats found/i, message: "İndirilebilir format bulunamadı." },
  { pattern: /ffmpeg/i, message: "ffmpeg bulunamadı. Kurulu olduğundan emin ol." },
  { pattern: /Requested format is not available/i, message: "İstenen format mevcut değil." },
  { pattern: /cookies/i, message: "Oturum açık içerik. Ayarlardan cookie dosyası yükle." },
];

function explainError(stderr: string): string {
  for (const { pattern, message } of ERROR_PATTERNS) {
    if (pattern.test(stderr)) return message;
  }
  return "İndirme başarısız. Link geçerli mi?";
}

const FORMAT_ARGS: Record<string, string[]> = {
  best: ["--format", "bestvideo+bestaudio/best", "--merge-output-format", "mp4"],
  "1080p": ["--format", "bestvideo[height<=1080]+bestaudio/best[height<=1080]", "--merge-output-format", "mp4"],
  "720p": ["--format", "bestvideo[height<=720]+bestaudio/best[height<=720]", "--merge-output-format", "mp4"],
  "480p": ["--format", "bestvideo[height<=480]+bestaudio/best[height<=480]", "--merge-output-format", "mp4"],
  audio: ["--format", "bestaudio/best", "--extract-audio", "--audio-format", "mp3"],
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const dir = request.nextUrl.searchParams.get("dir") || "downloads";
  const format = request.nextUrl.searchParams.get("format") || "best";

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  // Resolve relative to cwd; prevent escaping project root via absolute paths
  const outputDir = path.isAbsolute(dir)
    ? dir
    : path.join(process.cwd(), dir);
  fs.mkdirSync(outputDir, { recursive: true });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const formatArgs = FORMAT_ARGS[format] ?? FORMAT_ARGS.best;

      const ytdlpArgs = [
        "--output",
        `${outputDir}/%(uploader)s_%(id)s.%(ext)s`,
        ...formatArgs,
        "--no-playlist",
        "--newline",
      ];

      if (fs.existsSync(COOKIE_PATH)) {
        ytdlpArgs.push("--cookies", COOKIE_PATH);
      }

      ytdlpArgs.push(url);

      // Extend PATH so yt-dlp can find ffmpeg (Homebrew on macOS)
      const extendedPath = [
        "/opt/homebrew/bin",
        "/usr/local/bin",
        process.env.PATH ?? "",
      ].join(":");

      const proc = spawn("yt-dlp", ytdlpArgs, {
        env: { ...process.env, PATH: extendedPath },
      });

      let filename = "";
      let mergedFilename = ""; // set only when [Merger] fires
      let stderrBuffer = "";

      const handleLine = (line: string) => {
        // Progress: [download]  45.3% of 10.50MiB at 1.23MiB/s ETA 00:07
        const progressMatch = line.match(
          /\[download\]\s+([\d.]+)%\s+of\s+[\d.]+\w+\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/
        );
        if (progressMatch) {
          send("progress", {
            progress: parseFloat(progressMatch[1]),
            speed: progressMatch[2],
            eta: progressMatch[3],
          });
          return;
        }

        // Destination file — may fire multiple times (video stream, then audio stream)
        const destMatch = line.match(/\[download\] Destination: (.+)/);
        if (destMatch) {
          filename = path.basename(destMatch[1].trim());
        }

        // Merger output — this is the final merged file; takes priority over Destination
        const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/);
        if (mergeMatch) {
          mergedFilename = path.basename(mergeMatch[1].trim());
          send("progress", { progress: 99, speed: "", eta: "merging..." });
        }

        // ExtractAudio output — final .mp3 filename
        const extractMatch = line.match(/\[ExtractAudio\] Destination: (.+)/);
        if (extractMatch) {
          mergedFilename = path.basename(extractMatch[1].trim());
        }

        // Already-downloaded single file (no merge needed)
        const alreadyMatch = line.match(/\[download\] (.+) has already been downloaded/);
        if (alreadyMatch) {
          filename = path.basename(alreadyMatch[1].trim());
        }
      };

      proc.stdout.on("data", (chunk: Buffer) => {
        chunk.toString().split("\n").forEach(handleLine);
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stderrBuffer += text;
        text.split("\n").forEach(handleLine);
      });

      proc.on("close", (code) => {
        if (code === 0) {
          // Prefer merged filename; fall back to last Destination
          send("done", { filename: mergedFilename || filename });
          controller.close();
        } else {
          const explanation = explainError(stderrBuffer);
          send("error", { error: explanation });
          controller.close();
        }
      });

      request.signal.addEventListener("abort", () => {
        proc.kill();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
