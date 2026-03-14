import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { NextRequest } from "next/server";

const COOKIE_PATH = path.join(process.cwd(), ".cookies", "cookies.txt");

async function explainError(stderr: string): Promise<string> {
  const fallback = "İndirme başarısız. Link geçerli mi?";
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: `yt-dlp video indirme aracından şu hata geldi:\n\n${stderr.slice(-800)}\n\nKullanıcıya Türkçe, 1-2 cümle, teknik terim kullanmadan ne yanlış gittiğini açıkla. Sadece açıklamayı yaz.`,
        stream: false,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    const data = await res.json() as { response?: string };
    return data.response?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const dir = request.nextUrl.searchParams.get("dir") || "downloads";

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

      const ytdlpArgs = [
        "--output",
        `${outputDir}/%(uploader)s_%(id)s.%(ext)s`,
        "--format",
        "bestvideo+bestaudio/best",
        "--merge-output-format",
        "mp4",
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

      proc.on("close", async (code) => {
        if (code === 0) {
          // Prefer merged filename; fall back to last Destination
          send("done", { filename: mergedFilename || filename });
          controller.close();
        } else {
          const explanation = await explainError(stderrBuffer);
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
