import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, MessageCircle, MessageSquare } from "lucide-react";
import { db } from "@/db";
import { claims, products, type Claim, type Product } from "@/db/schema";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import SectionHead from "@/components/SectionHead";
import ProductCard from "@/components/ProductCard";
import HowItWorks from "@/components/HowItWorks";
import ClaimBoard from "@/components/ClaimBoard";
import { smsLink, waLink } from "@/lib/constants";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

async function getFeatured(): Promise<Product[]> {
  try {
    await ensureDb();
    return await db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt))
      .limit(8);
  } catch {
    return [];
  }
}

async function getClaims(): Promise<Claim[]> {
  try {
    await ensureDb();
    return await db.select().from(claims).orderBy(desc(claims.createdAt));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, liveClaims] = await Promise.all([getFeatured(), getClaims()]);

  return (
    <>
      <Hero />
      <Marquee />

      {/* Featured products */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            kicker="FRESH STOCK"
            title="המבחר החם של דן"
            sub="בוקסים אטומים וחבילות שנחתו אצלנו השבוע — במחירי זהב, עד גמר המלאי האחרון."
            action={
              <Link href="/shop" className="btn-ghost !py-2.5 text-sm">
                לכל החנות
                <ArrowLeft size={16} />
              </Link>
            }
          />
          {featured.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-10 text-center text-white/60">
              החנות מתמלאת בזהב בדיוק עכשיו — לכו לדף החנות בעוד רגע!
            </div>
          )}
        </div>
      </section>

      {/* Live claims preview */}
      <section className="relative py-6 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            kicker="LIVE CLAIMS & AUCTIONS"
            title="הערצות בלייב"
            sub="כמו קליימים בלייב, אבל כל השבוע: מציבים הצעה, מובילים עד הסוף ולוקחים את השלל. ההצעה הגבוהה מנצחת."
            action={
              <Link href="/claims" className="btn-ghost !py-2.5 text-sm">
                לכל ההערצות
                <ArrowLeft size={16} />
              </Link>
            }
          />
          <ClaimBoard initialClaims={liveClaims} preview />
        </div>
      </section>

      <HowItWorks />

      {/* Closing CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="glass-panel gold-border-glow relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center md:px-14">
            <div
              aria-hidden
              className="font-display pointer-events-none absolute inset-x-0 top-4 text-center text-[16vw] leading-none opacity-[0.06] select-none md:text-[7rem]"
            >
              CATCH GOLD
            </div>
            <div className="relative mx-auto mb-6 flex w-max items-center justify-center">
              <div className="halo absolute inset-[-60%] animate-glow-pulse rounded-full" />
              <Image
                src="/images/logo.jpg"
                alt="דן ידי זהב"
                width={110}
                height={110}
                className="animate-floaty relative rounded-full ring-4 ring-gold/50"
              />
            </div>
            <h2 className="text-gold-grad relative text-3xl font-black md:text-5xl">
              מוכנים לרדוף אחרי הזהב?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl leading-7 text-white/55">
              כתבו לי עכשיו בוואטסאפ או ב-SMS — אענה מהר, אשמור לכם את המוצר ונסגור הזמנה
              בלי כאב ראש. ידי זהב, מילה של דן.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={waLink("היי דן! אני רוצה לסגור הזמנה מהאתר.")}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                <MessageCircle size={18} />
                שלחו לי וואטסאפ
              </a>
              <a href={smsLink("היי דן! אני רוצה לסגור הזמנה מהאתר.")} className="btn-ghost">
                <MessageSquare size={17} />
                או מסרון SMS
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
