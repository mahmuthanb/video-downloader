import { spawn } from "child_process";

const extendedPath = ["/opt/homebrew/bin", "/usr/local/bin", process.env.PATH ?? ""].join(":");

export async function POST() {
  return new Promise<Response>((resolve) => {
    let output = "";
    let errOutput = "";

    const proc = spawn("yt-dlp", ["-U"], {
      env: { ...process.env, PATH: extendedPath },
    });

    proc.stdout.on("data", (chunk: Buffer) => { output += chunk.toString(); });
    proc.stderr.on("data", (chunk: Buffer) => { errOutput += chunk.toString(); });

    proc.on("close", (code) => {
      const combined = (output + errOutput).trim();
      resolve(Response.json({ success: code === 0, output: combined }));
    });
  });
}
