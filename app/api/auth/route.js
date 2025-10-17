import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = body?.email;
  if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });
  return NextResponse.json({ email });
}


