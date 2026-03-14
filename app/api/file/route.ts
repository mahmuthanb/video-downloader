import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  const dir = request.nextUrl.searchParams.get("dir") || "downloads";

  if (!name) {
    return new Response("Missing name", { status: 400 });
  }

  // Strip directory components to prevent path traversal
  const safeName = path.basename(name);
  const outputDir = path.isAbsolute(dir)
    ? dir
    : path.join(process.cwd(), dir);
  const filePath = path.join(outputDir, safeName);

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  const stream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      fileStream.destroy();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
