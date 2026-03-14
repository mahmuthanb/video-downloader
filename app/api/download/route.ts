import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  const outputDir = path.join(process.cwd(), "downloads");
  fs.mkdirSync(outputDir, { recursive: true });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const proc = spawn("yt-dlp", [
        "--output",
        `${outputDir}/%(uploader)s_%(id)s.%(ext)s`,
        "--format",
        "bestvideo+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "--no-playlist",
        "--newline",
        url,
      ]);

      let filename = "";

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

        // Destination file
        const destMatch = line.match(/\[download\] Destination: (.+)/);
        if (destMatch) {
          filename = path.basename(destMatch[1].trim());
        }

        // Merger output (merging audio+video)
        const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/);
        if (mergeMatch) {
          filename = path.basename(mergeMatch[1].trim());
          send("progress", { progress: 99, speed: "", eta: "merging..." });
        }
      };

      proc.stdout.on("data", (chunk: Buffer) => {
        chunk.toString().split("\n").forEach(handleLine);
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        chunk.toString().split("\n").forEach(handleLine);
      });

      proc.on("close", (code) => {
        if (code === 0) {
          send("done", { filename });
        } else {
          send("error", { error: "İndirme başarısız. Link geçerli mi?" });
        }
        controller.close();
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
