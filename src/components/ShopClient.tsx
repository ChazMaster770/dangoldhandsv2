"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import type { Product } from "@/db/schema";
import { PRODUCT_KINDS } from "@/lib/kinds";
import ProductCard from "./ProductCard";

type Tab = string;
type Sort = "featured" | "cheap" | "expensive";

const TABS: { key: Tab; label: string; icon?: typeof Sparkles }[] = [
  { key: "all", label: "הכול", icon: Sparkles },
  ...PRODUCT_KINDS.map((k) => ({ key: k.value as string, label: k.label })),
];

export default function ShopClient({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...products];
    if (tab !== "all") list = list.filter((p) => p.kind === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.setName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "cheap":
        list.sort((a, b) => a.price - b.price);
        break;
      case "expensive":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.id - a.id,
        );
    }
    return list;
  }, [products, tab, sort, query]);

  return (
    <div>
      {/* controls */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition-all ${
                tab === t.key
                  ? "bg-gradient-to-l from-goldlight to-gold text-[#241a02] shadow-[0_8px_24px_-6px_rgba(245,197,66,0.6)]"
                  : "border border-white/12 text-white/60 hover:border-gold/40 hover:text-goldlight"
              }`}
            >
              {t.icon && <t.icon size={15} />}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search size={15} className="absolute top-1/2 end-3.5 -translate-y-1/2 text-white/35" />
            <input
              className="input-dark !pe-10"
              placeholder="חיפוש מוצר..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input-dark w-auto cursor-pointer !py-2.5 text-sm font-bold"
          >
            <option value="featured">מומלץ</option>
            <option value="cheap">מהזול ליקר</option>
            <option value="expensive">מהיקר לזול</option>
          </select>
        </div>
      </div>

      {/* grid */}
      {filtered.length > 0 ? (
        <>
          <p className="mb-5 text-sm font-bold text-white/40">
            {filtered.length} מוצרים
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="glass-panel rounded-3xl p-14 text-center">
          <Search className="mx-auto mb-3 text-gold/60" size={30} />
          <p className="text-lg font-black text-white/75">לא מצאנו כלום בבוסטר הזה</p>
          <p className="mt-1 text-sm text-white/45">נסו חיפוש אחר או סינון אחר</p>
        </div>
      )}
    </div>
  );
}
