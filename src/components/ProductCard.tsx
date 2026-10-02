"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Boxes, Check, Layers, Package, PackageOpen, Plus } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "@/context/CartContext";
import { ils, kindLabel } from "@/lib/format";

const KIND_ICONS: Record<string, typeof Package> = {
  case: Package,
  "booster-box": Package,
  etb: PackageOpen,
  "booster-bundle": Boxes,
  blister: Layers,
  pack: Layers,
};

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;
  const KindIcon = KIND_ICONS[product.kind] ?? Layers;

  const handleAdd = () => {
    add({
      id: product.id,
      name: product.name,
      kind: product.kind,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -8 }}
      className={`shine group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-[#151531] to-[#0d0d22] transition-shadow duration-500 hover:border-gold/40 hover:shadow-[0_24px_70px_-20px_rgba(245,197,66,0.35)] ${
        soldOut ? "opacity-70" : ""
      }`}
    >
      {/* image */}
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
            soldOut ? "grayscale" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d22] via-transparent to-transparent" />

        {/* chips */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="chip !bg-night/70 backdrop-blur-sm">
            <KindIcon size={13} />
            {kindLabel(product.kind)}
          </span>
          <div className="flex flex-col items-end gap-1.5">
            {product.badge && !soldOut && (
              <span className="chip !border-gold/60 !bg-gold/90 !text-[#241a02] shadow-lg">
                {product.badge}
              </span>
            )}
            {!soldOut && product.stock <= 3 && (
              <span className="chip !border-red-400/50 !bg-red-500/85 !text-white">
                נשארו {product.stock}!
              </span>
            )}
          </div>
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px]">
            <span className="rounded-full border border-white/25 bg-black/60 px-5 py-2 text-sm font-black tracking-wide text-white/85">
              אזל מהמלאי
            </span>
          </div>
        )}
      </div>

      {/* content */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div>
          <h3 className="text-lg leading-snug font-extrabold">{product.name}</h3>
          {product.setName && (
            <p className="font-display mt-0.5 text-[10px] tracking-[0.22em] text-white/35 uppercase">
              {product.setName}
            </p>
          )}
        </div>
        {product.description && (
          <p className="line-clamp-2 flex-1 text-sm leading-6 text-white/50">
            {product.description}
          </p>
        )}

        <div className="mt-2 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-gold-grad text-2xl font-black">{ils(product.price)}</span>
              {product.compareAt && product.compareAt > product.price && (
                <span className="text-sm text-white/35 line-through">
                  {ils(product.compareAt)}
                </span>
              )}
            </div>
            {!soldOut && (
              <span className="text-[11px] text-emerald-300/80">
                {product.stock > 3 ? "במלאי • משלוח מהיר" : "כמעט נגמר"}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-black transition-all ${
              added
                ? "bg-emerald-400 text-[#06210f]"
                : "btn-gold !px-4 !py-2.5 text-sm"
            } disabled:pointer-events-none disabled:opacity-40`}
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
            {added ? "בסל!" : "הוספה"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
