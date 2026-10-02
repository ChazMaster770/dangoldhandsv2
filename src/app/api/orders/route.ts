import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, type OrderItem } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";
import { KIND_VALUES } from "@/lib/kinds";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json({ orders: rows });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const b = await req.json().catch(() => null);
  if (!b || typeof b.name !== "string" || !b.name.trim()) {
    return NextResponse.json({ error: "שם חובה" }, { status: 400 });
  }
  const items = Array.isArray(b.items) ? (b.items as OrderItem[]) : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "הסל ריק" }, { status: 400 });
  }

  const cleanItems: OrderItem[] = items
    .filter((i) => i && typeof i.name === "string" && Number(i.qty) > 0)
    .map((i) => ({
      id: Number(i.id) || 0,
      name: String(i.name),
      kind: KIND_VALUES.includes(i.kind) ? String(i.kind) : "pack",
      price: Math.max(0, Math.round(Number(i.price) || 0)),
      qty: Math.min(99, Math.round(Number(i.qty))),
    }));

  const total = cleanItems.reduce((a, i) => a + i.qty * i.price, 0);
  const channel = b.channel === "sms" ? "sms" : "whatsapp";

  try {
    const [row] = await db
      .insert(orders)
      .values({
        name: b.name.trim(),
        phone: typeof b.phone === "string" ? b.phone.trim() || null : null,
        note: typeof b.note === "string" ? b.note.trim() || null : null,
        channel,
        items: cleanItems,
        total,
      })
      .returning();

    return NextResponse.json({ order: row }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders failed:", err);
    return NextResponse.json(
      { error: "שגיאת שרת בשמירה — נסו שוב או שלחו את ההזמנה ישירות בוואטסאפ" },
      { status: 500 },
    );
  }
}
