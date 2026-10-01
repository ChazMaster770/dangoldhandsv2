import { NextRequest, NextResponse } from "next/server";
import { adminCookie, checkPassword, sessionValue } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const password = typeof b?.password === "string" ? b.password : "";
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "סיסמה לא נכונה" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie.name, sessionValue(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: adminCookie.maxAge,
  });
  return res;
}
