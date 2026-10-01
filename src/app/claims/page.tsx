import { desc } from "drizzle-orm";
import { db } from "@/db";
import { claims, type Claim } from "@/db/schema";
import ClaimBoard from "@/components/ClaimBoard";
import SectionHead from "@/components/SectionHead";
import { Gavel, HandCoins, Trophy } from "lucide-react";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "הערצות בלייב | דן ידי זהב",
  description: "הערצות וקליימים על מוצרי פוקימון נדירים — מציבים הצעה, מובילים עד הסוף ולוקחים את השלל.",
};

async function getClaims(): Promise<Claim[]> {
  try {
    await ensureDb();
    return await db.select().from(claims).orderBy(desc(claims.createdAt));
  } catch {
    return [];
  }
}

export default async function ClaimsPage() {
  const items = await getClaims();

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="LIVE CLAIMS & AUCTIONS"
          title="הערצות בלייב"
          sub="בדיוק כמו קליימים בלייב של דן: מציבים הצעה שווה או גבוהה מהמינימום, מובילים עד ששעון נגמר — ולוקחים את הפריט הביתה."
        />

        {/* rules */}
        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Gavel,
              title: "1. מציבים הצעה",
              text: "שם + טלפון + סכום לפי המינימום. ההצעה מחייבת כמו קריאה בלייב.",
            },
            {
              icon: HandCoins,
              title: "2. שומרים על ההובלה",
              text: "אם עוקפים אתכם — אפשר להציב שוב עד שהשעון נגמר. הצעד המינימלי בכל כרטיס.",
            },
            {
              icon: Trophy,
              title: "3. לוקחים את השלל",
              text: "הזוכה מקבל הודעה מדן בוואטסאפ לסגירת תשלום ומשלוח. ידי זהב עושות את השאר.",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="glass-panel flex items-start gap-3.5 rounded-2xl p-5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-goldlight">
                <r.icon size={18} />
              </span>
              <div>
                <p className="font-black">{r.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <ClaimBoard initialClaims={items} />
      </div>
    </section>
  );
}
