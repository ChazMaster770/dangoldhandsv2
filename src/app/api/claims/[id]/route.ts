import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { claims } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await ctx.params;
  const cid = parseInt(id, 10);
  if (!Number.isInteger(cid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const b = await req.json().catch(() => ({}));

  const patch: Partial<typeof claims.$inferInsert> = {};
  if (typeof b.title === "string") patch.title = b.title.trim();
  if (typeof b.description === "string") patch.description = b.description.trim() || null;
  if (typeof b.image === "string") patch.image = b.image.trim();
  if (b.status === "live" || b.status === "closed") patch.status = b.status;
  if (b.endsAt !== undefined) {
    patch.endsAt = b.endsAt ? new Date(b.endsAt) : null;
  }
  if (b.minIncrement !== undefined) {
    patch.minIncrement = Math.max(1, Math.round(Number(b.minIncrement) || 10));
  }

  const [row] = await db.update(claims).set(patch).where(eq(claims.id, cid)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ claim: row });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await ctx.params;
  const cid = parseInt(id, 10);
  if (!Number.isInteger(cid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  await db.delete(claims).where(eq(claims.id, cid));
  return NextResponse.json({ ok: true });
}
