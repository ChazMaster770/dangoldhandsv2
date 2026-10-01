import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bids, claims } from "@/db/schema";
import { ils } from "@/lib/format";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  await ensureDb();
  const { id } = await ctx.params;
  const cid = parseInt(id, 10);
  if (!Number.isInteger(cid)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const b = await req.json().catch(() => null);
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const phone = typeof b?.phone === "string" ? b.phone.trim() : "";
  const amount = Math.round(Number(b?.amount));

  if (!name || !phone) {
    return NextResponse.json({ error: "שם וטלפון חובה" }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json({ error: "מספר טלפון לא נראה תקין" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "סכום הצעה לא תקין" }, { status: 400 });
  }

  const result = await db.transaction(async (tx) => {
    const [claim] = await tx.select().from(claims).where(eq(claims.id, cid));
    if (!claim) return { code: 404 as const, error: "ההערצה לא נמצאה" };

    if (claim.status !== "live") {
      return { code: 400 as const, error: "ההערצה הזו כבר נסגרה" };
    }
    if (claim.endsAt && new Date(claim.endsAt).getTime() <= Date.now()) {
      await tx.update(claims).set({ status: "closed" }).where(eq(claims.id, cid));
      return { code: 400 as const, error: "ההערצה הסתיימה — טיפה איחרתם!" };
    }

    const min = claim.bidsCount > 0 ? claim.currentBid + claim.minIncrement : claim.startPrice;
    if (amount < min) {
      return {
        code: 400 as const,
        error: `ההצעה המינימלית עכשיו היא ${ils(min)}`,
        min,
      };
    }

    await tx.insert(bids).values({ claimId: cid, name, phone, amount });
    const [updated] = await tx
      .update(claims)
      .set({
        currentBid: amount,
        currentBidder: name,
        bidsCount: claim.bidsCount + 1,
      })
      .where(eq(claims.id, cid))
      .returning();

    return { code: 200 as const, claim: updated };
  });

  if (result.code !== 200) {
    return NextResponse.json(
      { error: result.error, min: "min" in result ? result.min : undefined },
      { status: result.code },
    );
  }
  return NextResponse.json({
    claim: result.claim,
    min: result.claim.currentBid + result.claim.minIncrement,
  });
}
