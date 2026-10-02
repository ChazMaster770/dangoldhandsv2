import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { appMeta, products, claims } from "./schema";

const SEED_FLAG = "catalog_seeded_v2";

/**
 * One-time starter catalogue seeding. Runs only until it records a flag in
 * app_meta — afterwards nothing is re-seeded, so admin deletions stick.
 */
export async function ensureSeed() {
  const [{ value: flagged }] = await db
    .select({ value: count() })
    .from(appMeta)
    .where(eq(appMeta.key, SEED_FLAG));
  if (flagged > 0) return;

  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(products);
  const [{ value: claimCount }] = await db
    .select({ value: count() })
    .from(claims);

  if (productCount === 0 && claimCount === 0) {
    await db.insert(products).values([
      {
        name: "בוסטר בוקס \"זהב מבריק\" — 36 חבילות",
        setName: "Golden Bolt Collection",
        kind: "booster-box",
        price: 649,
        compareAt: 719,
        image: "/images/products/box-gold.jpg",
        description:
          "שקית הבוסטר המלאה של דן: 36 חבילות אטומות, סיכוי לקלפי SSP הולו וצ'אריזארד. נאטם לפניכם בלייב לפי בקשה.",
        badge: "הכי חם",
        stock: 4,
        featured: true,
      },
      {
        name: "בוסטר בוקס \"גלקסי סגול\" — 36 חבילות",
        setName: "Nebula Violet",
        kind: "booster-box",
        price: 689,
        compareAt: 749,
        image: "/images/products/box-violet.jpg",
        description:
          "בוקס אטום עם 36 חבילות מהסט המבוקש. אפשרות לפתיחה בלייב משותף או משלוח אטום עד הבית.",
        badge: "חדש",
        stock: 3,
        featured: true,
      },
      {
        name: "קופסת מאמן עלית (ETB) \"תדר כחול\"",
        setName: "Elite Volt ETB",
        kind: "etb",
        price: 289,
        compareAt: 329,
        image: "/images/products/box-cyan.jpg",
        description:
          "ETB אטומה: 9 חבילות, קלף פרומו, מגני קלפים וקוביות אנרגיה. מתנה מושלמת לאספנים.",
        badge: "משתלם",
        stock: 6,
        featured: true,
      },
      {
        name: "חבילת בוסטר \"ברק צהוב\"",
        setName: "Golden Bolt",
        kind: "pack",
        price: 24,
        compareAt: null,
        image: "/images/products/pack-yellow.jpg",
        description:
          "חבילת בוסטר אחת אטומה — 10 קלפים + קוד אונליין. מזל טוב שמור בפנים?",
        badge: "פופולרי",
        stock: 40,
        featured: true,
      },
      {
        name: "חבילת בוסטר \"להבה אדומה\"",
        setName: "Crimson Flame",
        kind: "blister",
        price: 22,
        compareAt: null,
        image: "/images/products/pack-red.jpg",
        description: "חבילת בוסטר אטומה מסדרת האש — הולו נדיר מובטח בכל חבילה.",
        badge: null,
        stock: 32,
        featured: false,
      },
      {
        name: "חבילת בוסטר \"אוקיינוס כחול\"",
        setName: "Deep Ocean",
        kind: "pack",
        price: 22,
        compareAt: null,
        image: "/images/products/pack-blue.jpg",
        description: "חבילת בוסטר אטומה מסדרת המים — עומק כמו הים, נדירות כמו פנינה.",
        badge: null,
        stock: 28,
        featured: false,
      },
      {
        name: "מארז אספן — רביעיית קלפי פרומו",
        setName: "Collector's Vault",
        kind: "case",
        price: 39,
        compareAt: 49,
        image:
          "https://images.pexels.com/photos/37743085/pexels-photo-37743085.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "רביעיית קלפי פרומו נדירים במצב Gem Mint, נשלחים בטופ-לודר מוגן. אחריות של דן על מצב הקלף.",
        badge: "נדיר",
        stock: 12,
        featured: false,
      },
      {
        name: "צרור 5 חבילות + קלף הפתעה",
        setName: "Dan's Lucky Bundle",
        kind: "booster-bundle",
        price: 99,
        compareAt: 117,
        image:
          "https://images.pexels.com/photos/37743086/pexels-photo-37743086.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "הצרור החתום של דן: 5 חבילות אטומות + קלף הפתעה ברמה של הולו ומעלה. ידי זהב אמרנו?",
        badge: "משתלם",
        stock: 15,
        featured: true,
      },
    ]);
    console.log("[db] Seeded 8 products");

    const now = Date.now();
    await db.insert(claims).values([
      {
        title: "קלף דרקון זהב SSP — הולו קשת",
        description:
          "הקלף שהדליק את הלייב האחרון: דרקון זהב SSP בהולו קשת מלא, מצב Gem Mint, נשלח בטופ לודר מוגן עם ביטוח.",
        image: "/images/products/card-rare.jpg",
        startPrice: 350,
        minIncrement: 25,
        currentBid: 350,
        currentBidder: null,
        bidsCount: 0,
        status: "live",
        endsAt: new Date(now + 1000 * 60 * 60 * 50),
      },
      {
        title: "בוקס גלקסי סגול אטום — הערצת לייב",
        description:
          "בוקס אטום לגמרי, 36 חבילות. אפשרות לפתיחה משותפת בלייב לזוכה. דואר רשום עלינו.",
        image: "/images/products/box-violet.jpg",
        startPrice: 400,
        minIncrement: 20,
        currentBid: 400,
        currentBidder: null,
        bidsCount: 0,
        status: "live",
        endsAt: new Date(now + 1000 * 60 * 60 * 26),
      },
      {
        title: "מארז לייב: 10 חבילות מעורבות + פרומו",
        description:
          "מארז הערצה מיוחד מהלייב: 10 חבילות אטומות מעורבות + קלף פרומו אנרגיה נדיר. פתיחה בלייב לזוכה.",
        image:
          "https://images.pexels.com/photos/37743086/pexels-photo-37743086.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        startPrice: 120,
        minIncrement: 10,
        currentBid: 120,
        currentBidder: null,
        bidsCount: 0,
        status: "live",
        endsAt: new Date(now + 1000 * 60 * 60 * 70),
      },
    ]);
    console.log("[db] Seeded 3 claims");
  }

  // Seeding records a flag and runs at most once — afterwards deletions stick.
  await db
    .insert(appMeta)
    .values({ key: SEED_FLAG, value: new Date().toISOString() })
    .onConflictDoNothing({ target: appMeta.key });
}
