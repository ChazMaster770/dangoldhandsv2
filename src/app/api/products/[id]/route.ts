import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";
import { KIND_VALUES } from "@/lib/kinds";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await ctx.params;
  const pid = parseInt(id, 10);
  if (!Number.isInteger(pid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const b = await req.json().catch(() => ({}));

  const patch: Partial<typeof products.$inferInsert> = {};
  if (typeof b.name === "string") patch.name = b.name.trim();
  if (typeof b.setName === "string") patch.setName = b.setName.trim() || null;
  if (typeof b.description === "string") patch.description = b.description.trim() || null;
  if (typeof b.badge === "string") patch.badge = b.badge.trim() || null;
  if (typeof b.image === "string") patch.image = b.image.trim();
  if (KIND_VALUES.includes(b.kind)) patch.kind = b.kind;
  if (typeof b.featured === "boolean") patch.featured = b.featured;
  if (b.price !== undefined) {
    const price = Math.round(Number(b.price));
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "מחיר לא תקין" }, { status: 400 });
    }
    patch.price = price;
  }
  if (b.compareAt !== undefined) {
    patch.compareAt =
      b.compareAt === null || b.compareAt === ""
        ? null
        : Math.max(0, Math.round(Number(b.compareAt)));
  }
  if (b.stock !== undefined) {
    patch.stock = Math.max(0, Math.round(Number(b.stock) || 0));
  }

  const [row] = await db
    .update(products)
    .set(patch)
    .where(eq(products.id, pid))
    .returning();

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ product: row });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await ctx.params;
  const pid = parseInt(id, 10);
  if (!Number.isInteger(pid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  await db.delete(products).where(eq(products.id, pid));
  return NextResponse.json({ ok: true });
}
