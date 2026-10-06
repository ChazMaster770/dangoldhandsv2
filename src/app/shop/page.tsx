import { desc } from "drizzle-orm";
import { MessageCircle } from "lucide-react";
import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import ShopClient from "@/components/ShopClient";
import SectionHead from "@/components/SectionHead";
import { waLink } from "@/lib/constants";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "החנות | דן ידי זהב",
  description: "מארזים, בוסטר בוקס, איטיבי וחבילות פוקימון במחירי זהב — בוחרים ושולחים הזמנה בוואטסאפ או ב-SMS.",
};

async function getProducts(): Promise<Product[]> {
  try {
    await ensureDb();
    return await db.select().from(products).orderBy(desc(products.createdAt));
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const items = await getProducts();

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="THE GOLDEN SHOP"
          title="החנות של דן"
          sub="מארזים, בוסטר בוקס, איטיבי וחבילות פוקימון מקוריות. מוסיפים לסל ושולחים את ההזמנה ישירות בוואטסאפ או ב-SMS — בלי הרשמה ובלי כרטיס."
          action={
            <a
              href={waLink("היי דן! רציתי לשאול על זמינות של מוצר בחנות.")}
              target="_blank"
              rel="noreferrer"
              className="chip !text-sm"
            >
              <MessageCircle size={15} />
              שאלה על זמינות? כתבו בוואטסאפ
            </a>
          }
        />
        <ShopClient products={items} />
      </div>
    </section>
  );
}
