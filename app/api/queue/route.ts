import { NextRequest, NextResponse } from "next/server";

const pendingUrls: string[] = [];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ success: false }, { status: 400, headers: CORS_HEADERS });
  }
  pendingUrls.push(body.url.trim());
  return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
}

export async function GET() {
  const urls = [...pendingUrls];
  pendingUrls.splice(0, pendingUrls.length);
  return NextResponse.json({ urls }, { headers: CORS_HEADERS });
}
