import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, checkPassword, clip, signSession } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD não está configurado no servidor." }, { status: 500 });
  }
  // pequeno atraso contra tentativas em massa
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(clip(body.password, 200))) {
    return NextResponse.json({ error: "Palavra-passe incorreta." }, { status: 401 });
  }
  const s = signSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, s.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: s.maxAge,
  });
  return res;
}
