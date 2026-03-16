import { spawnSync } from "child_process";
import { NextResponse } from "next/server";

export async function GET() {
  // zip -r - chrome-extension  →  outputs zip bytes to stdout
  const result = spawnSync("zip", ["-r", "-", "chrome-extension"], {
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error || result.status !== 0) {
    return NextResponse.json({ error: "zip komutu bulunamadı" }, { status: 500 });
  }

  return new NextResponse(result.stdout, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="vaultdl-helper.zip"',
    },
  });
}
