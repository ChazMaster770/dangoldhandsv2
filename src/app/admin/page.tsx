import { desc } from "drizzle-orm";
import { db } from "@/db";
import { claims, orders, products, type Claim, type Order, type Product } from "@/db/schema";
import { isAdminCookies } from "@/lib/admin";
import { ensureDb } from "@/db/ensure";
import LoginForm from "@/components/admin/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ניהול | דן ידי זהב",
  robots: { index: false },
};

export default async function AdminPage() {
  const ok = await isAdminCookies();
  if (!ok) {
    return (
      <section className="grid min-h-[70vh] place-items-center px-4 py-20">
        <LoginForm />
      </section>
    );
  }

  let productList: Product[] = [];
  let claimList: Claim[] = [];
  let orderList: Order[] = [];
  try {
    await ensureDb();
    [productList, claimList, orderList] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      db.select().from(claims).orderBy(desc(claims.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
    ]);
  } catch {
    /* tables may not exist yet */
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <AdminDashboard
        initialProducts={productList}
        initialClaims={claimList}
        initialOrders={orderList}
      />
    </section>
  );
}
