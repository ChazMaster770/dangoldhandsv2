import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { claims } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const rows = await db.select().from(claims).orderBy(desc(claims.createdAt));
  return NextResponse.json({ claims: rows });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const b = await req.json().catch(() => null);
  if (!b || typeof b.title !== "string" || !b.title.trim()) {
    return NextResponse.json({ error: "כותרת חובה" }, { status: 400 });
  }
  const startPrice = Math.round(Number(b.startPrice));
  if (!Number.isFinite(startPrice) || startPrice <= 0) {
    return NextResponse.json({ error: "מחיר פתיחה לא תקין" }, { status: 400 });
  }

  let endsAt: Date | null = null;
  if (b.endsAt) {
    const d = new Date(b.endsAt);
    if (!isNaN(d.getTime())) endsAt = d;
  }

  try {
    const [row] = await db
      .insert(claims)
      .values({
        title: b.title.trim(),
        description: typeof b.description === "string" ? b.description.trim() || null : null,
        image: typeof b.image === "string" && b.image.trim() ? b.image.trim() : "/images/products/card-rare.jpg",
        startPrice,
        minIncrement: Math.max(1, Math.round(Number(b.minIncrement) || 10)),
        currentBid: startPrice,
        status: "live",
        endsAt,
      })
      .returning();

    return NextResponse.json({ claim: row }, { status: 201 });
  } catch (err) {
    console.error("POST /api/claims failed:", err);
    return NextResponse.json(
      { error: "שגיאת שרת בשמירה — בדקו שה-database מוגדר (DATABASE_URL)" },
      { status: 500 },
    );
  }
}
