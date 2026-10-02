import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";
import { KIND_VALUES } from "@/lib/kinds";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const b = await req.json().catch(() => null);
  if (!b || typeof b.name !== "string" || !b.name.trim()) {
    return NextResponse.json({ error: "שם מוצר חובה" }, { status: 400 });
  }
  if (typeof b.image !== "string" || !b.image.trim()) {
    return NextResponse.json({ error: "תמונה חובה" }, { status: 400 });
  }
  const price = Math.round(Number(b.price));
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "מחיר לא תקין" }, { status: 400 });
  }
  const compareAt =
    b.compareAt === null || b.compareAt === undefined || b.compareAt === ""
      ? null
      : Math.round(Number(b.compareAt));

  try {
    const [row] = await db
      .insert(products)
      .values({
        name: b.name.trim(),
        setName: typeof b.setName === "string" ? b.setName.trim() || null : null,
        kind: KIND_VALUES.includes(b.kind) ? String(b.kind) : "pack",
        price,
        compareAt: compareAt && compareAt > price ? compareAt : null,
        image: b.image.trim(),
        description: typeof b.description === "string" ? b.description.trim() || null : null,
        badge: typeof b.badge === "string" ? b.badge.trim() || null : null,
        stock: Number.isFinite(Number(b.stock)) ? Math.max(0, Math.round(Number(b.stock))) : 10,
        featured: Boolean(b.featured),
      })
      .returning();

    return NextResponse.json({ product: row }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products failed:", err);
    return NextResponse.json(
      { error: "שגיאת שרת בשמירה — בדקו שה-database מוגדר (DATABASE_URL)" },
      { status: 500 },
    );
  }
}
