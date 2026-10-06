"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { waLink } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const FLOATERS = [
  { src: "/images/products/pack-yellow.jpg", className: "-top-2 right-[8%] w-20 -rotate-12", rot: "-12deg", delay: 0 },
  { src: "/images/products/box-gold.jpg", className: "bottom-[6%] right-[90%] w-24 rotate-6", rot: "6deg", delay: 1.1 },
  { src: "/images/products/card-rare.jpg", className: "bottom-[14%] left-[4%] w-20 -rotate-6", rot: "-6deg", delay: 2 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
      {/* backdrop word */}
      <div
        aria-hidden
        className="font-display pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-[17vw] leading-none whitespace-nowrap opacity-[0.14] select-none md:text-[9rem]"
      >
        <span className="outline-word">GOLD HANDS</span>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-8 lg:grid-cols-[1.15fr_1fr]">
        {/* copy */}
        <div>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <span className="chip">
              <Sparkles size={13} />
              לייבים • פתיחות • מכירות
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-6xl leading-[1.02] font-black md:text-[5.4rem]"
          >
            <span className="text-gold-grad drop-shadow-[0_6px_30px_rgba(245,197,66,0.25)]">
              דן ידי זהב
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-4 max-w-xl leading-8 text-white/55"
          >
            הבית של קהילת ה-TCG בישראל: מוצרים מקוריים בלבד, פתיחות חיות כל שבוע
            וממבצעי הזהב של דן. מזמינים בלחיצה אחת — ההזמנה מגיעה אלינו ישירות
            בוואטסאפ או ב-SMS.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/shop" className="btn-gold">
              <ShoppingBag size={18} />
              לחנות
            </Link>
            <Link href="/claims" className="btn-ghost">
              <Gavel size={18} />
              מכירות פומביות
              <span className="animate-live-dot h-2 w-2 rounded-full bg-red-400" />
            </Link>
            <a
              href={waLink("היי דן! הגעתי מהאתר, רציתי לשאול שאלה על המוצרים.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-emerald-300 transition hover:text-emerald-200"
            >
              <MessageCircle size={17} />
              דברו איתי
            </a>
          </motion.div>

          {/* stats */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4"
          >
            {[
              { num: "5,000+", label: "קהילה בלייבים" },
              { num: "300+", label: "בוקסים נאטמו" },
              { num: "100%", label: "מקורי ואטום" },
            ].map((s) => (
              <div key={s.label} className="border-s-2 border-gold/40 ps-3">
                <p className="text-gold-grad text-xl font-black md:text-2xl">{s.num}</p>
                <p className="mt-0.5 text-xs text-white/45">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* logo stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto flex aspect-square w-full max-w-[26rem] items-center justify-center lg:max-w-none"
        >
          {/* halo */}
          <div className="halo absolute inset-[-14%] animate-glow-pulse rounded-full" />
          {/* spinning dashed ring */}
          <svg viewBox="0 0 200 200" className="animate-spin-slower absolute inset-0 h-full w-full" aria-hidden>
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="rgba(245,197,66,0.4)"
              strokeWidth="1.2"
              strokeDasharray="3 9"
              strokeLinecap="round"
            />
          </svg>
          {/* golden ring + logo */}
          <div className="ring-logo animate-floaty relative rounded-full p-[7px]" style={{ ["--float-rot" as never]: "0deg" }}>
            <div className="rounded-full bg-night p-1.5">
              <Image
                src="/images/logo.jpg"
                alt="דן ידי זהב — לוגו"
                width={380}
                height={380}
                priority
                className="w-[min(68vw,380px)] rounded-full"
              />
            </div>
          </div>

          {/* floating product chips */}
          {FLOATERS.map((f) => (
            <motion.div
              key={f.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + f.delay * 0.3 }}
              className={`animate-floaty absolute ${f.className}`}
              style={{ ["--float-rot" as never]: f.rot, animationDelay: `${f.delay}s` }}
            >
              <span className="relative block aspect-square overflow-hidden rounded-2xl border border-gold/35 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7)]">
                <Image src={f.src} alt="" fill sizes="96px" className="object-cover" />
              </span>
            </motion.div>
          ))}

          {/* authenticity sticker */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="absolute top-[6%] left-[6%] -rotate-6 rounded-2xl border border-gold/50 bg-[#0c0c24]/90 px-4 py-2.5 shadow-xl backdrop-blur"
          >
            <p className="flex items-center gap-2 text-sm font-black text-goldlight">
              <ShieldCheck size={16} />
              100% מקורי ואטום
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
