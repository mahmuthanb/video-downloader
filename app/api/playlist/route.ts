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
    }, 30_000);

    let output = "";

    const proc = spawn(
      "yt-dlp",
      ["--flat-playlist", "--dump-single-json", "--no-warnings", url],
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
        if (json._type === "playlist" && Array.isArray(json.entries)) {
          const entries = json.entries.map((e: Record<string, unknown>) => ({
            url: (e.webpage_url ?? e.url) as string,
            title: (e.title as string) ?? null,
            thumbnail: (e.thumbnail as string) ?? null,
          })).filter((e: { url: string }) => !!e.url);
          resolve(Response.json({ type: "playlist", title: json.title ?? null, entries }));
        } else {
          // Single video
          resolve(Response.json({
            type: "video",
            title: json.title ?? null,
            entries: [{ url: (json.webpage_url ?? url) as string, title: (json.title as string) ?? null, thumbnail: (json.thumbnail as string) ?? null }],
          }));
        }
      } catch {
        resolve(new Response("Parse error", { status: 500 }));
      }
    });
  });
}
