import { spawn } from "child_process";
import { NextRequest } from "next/server";

const extendedPath = ["/opt/homebrew/bin", "/usr/local/bin", process.env.PATH ?? ""].join(":");

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  return new Promise<Response>((resolve) => {
    const timeout = setTimeout(() => {
      proc.kill();
      resolve(new Response("Timeout", { status: 504 }));
    }, 20_000);

    let output = "";

    const proc = spawn(
      "yt-dlp",
      ["--dump-json", "--no-playlist", "--no-warnings", url],
      { env: { ...process.env, PATH: extendedPath } }
    );

    proc.stdout.on("data", (chunk: Buffer) => { output += chunk.toString(); });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0 || !output) {
        resolve(new Response("Failed", { status: 422 }));
        return;
      }
      try {
        const json = JSON.parse(output);
        resolve(Response.json({
          title: json.title ?? null,
          thumbnail: json.thumbnail ?? null,
          tags: Array.isArray(json.tags) ? json.tags.slice(0, 10) : [],
          categories: Array.isArray(json.categories) ? json.categories : [],
          uploader: json.uploader ?? json.channel ?? null,
          duration: typeof json.duration === "number" ? json.duration : null,
        }));
      } catch {
        resolve(new Response("Parse error", { status: 500 }));
      }
    });
  });
}
