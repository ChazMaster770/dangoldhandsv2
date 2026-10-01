import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "confirmed", "shipped", "done"] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await ctx.params;
  const oid = parseInt(id, 10);
  if (!Number.isInteger(oid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const b = await req.json().catch(() => ({}));
  if (!STATUSES.includes(b.status)) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }
  const [row] = await db
    .update(orders)
    .set({ status: b.status })
    .where(eq(orders.id, oid))
    .returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ order: row });
}
