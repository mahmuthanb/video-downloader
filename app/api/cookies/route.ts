import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

const COOKIE_DIR = path.join(process.cwd(), ".cookies");
const COOKIE_PATH = path.join(COOKIE_DIR, "cookies.txt");

export async function GET() {
  const exists = fs.existsSync(COOKIE_PATH);
  return Response.json({ loaded: exists });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response("Missing file", { status: 400 });
  }

  const text = await file.text();
  fs.mkdirSync(COOKIE_DIR, { recursive: true });
  fs.writeFileSync(COOKIE_PATH, text, { mode: 0o600 });

  return Response.json({ loaded: true });
}

export async function DELETE() {
  if (fs.existsSync(COOKIE_PATH)) {
    fs.unlinkSync(COOKIE_PATH);
  }
  return Response.json({ loaded: false });
}
