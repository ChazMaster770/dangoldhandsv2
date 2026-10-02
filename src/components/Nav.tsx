"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageCircle, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { waLink } from "@/lib/constants";

const LINKS = [
  { href: "/", label: "בית" },
  { href: "/shop", label: "החנות" },
  { href: "/claims", label: "מכירות פומביות", live: true },
  { href: "/#how", label: "איך קונים" },
];

export default function Nav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/10 bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative">
            <Image
              src="/images/logo.jpg"
              alt="דן ידי זהב"
              width={46}
              height={46}
              priority
              className="rounded-full ring-2 ring-gold/60 transition-transform duration-500 group-hover:rotate-[15deg]"
            />
            <span className="absolute inset-0 rounded-full bg-gold/25 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
          </span>
          <span className="leading-tight">
            <span className="text-gold-grad block text-lg font-black">דן ידי זהב</span>
            <span className="font-display block text-[9px] tracking-[0.28em] text-white/45">
              DAN GOLD HANDS TCG
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active =
              (l.href === "/" && pathname === "/") ||
              (l.href !== "/" && !l.href.includes("#") && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  active ? "text-goldlight" : "text-white/65 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  {l.label}
                  {l.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-live-dot absolute inline-flex h-2 w-2 rounded-full bg-red-400" />
                    </span>
                  )}
                </span>
                {active && (
                  <span className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-l from-transparent via-gold to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href={waLink("היי דן! הגעתי מהאתר, רציתי לשאול לגבי מוצרי פוקימון TCG.")}
            target="_blank"
            rel="noreferrer"
            className="btn-gold hidden !px-4 !py-2 text-sm sm:inline-flex"
          >
            <MessageCircle size={16} />
            וואטסאפ
          </a>
          <button
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-gold/35 bg-gold/5 text-goldlight transition-all hover:border-gold/70 hover:bg-gold/15"
            aria-label="פתח סל"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1.5 -left-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-black text-[#241a02] shadow">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 md:hidden"
            aria-label="תפריט"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-gold/10 bg-night/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-white/80 transition-colors hover:bg-white/5 hover:text-goldlight"
              >
                {l.label}
                {l.live && <span className="animate-live-dot h-2 w-2 rounded-full bg-red-400" />}
              </Link>
            ))}
            <a
              href={waLink("היי דן! הגעתי מהאתר, רציתי לשאול לגבי מוצרי פוקימון TCG.")}
              target="_blank"
              rel="noreferrer"
              className="btn-gold mt-2 !py-3 text-sm"
            >
              <MessageCircle size={16} />
              דברו עם דן בוואטסאפ
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
