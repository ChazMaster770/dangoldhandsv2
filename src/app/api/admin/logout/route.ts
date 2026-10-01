import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie.name, "", { path: "/", maxAge: 0 });
  return res;
}
