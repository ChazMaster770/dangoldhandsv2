"use client";

import { motion } from "framer-motion";
import { MessageCircle, MessageSquare, ShoppingBag, Truck } from "lucide-react";
import { waLink } from "@/lib/constants";

const STEPS = [
  {
    num: "01",
    icon: ShoppingBag,
    title: "בוחרים ומוסיפים לסל",
    text: "מסמנים מארזים, בוסטר בוקס, איטיבי וחבילות פוקימון — בלי הרשמה, בלי כרטיס אשראי ובלי דאגות.",
  },
  {
    num: "02",
    icon: MessageCircle,
    title: "שולחים בלחיצה אחת",
    text: "האתר בונה הודעה מסודרת עם כל הפרטים והמחיר — שולחים לדן בוואטסאפ או במסרון SMS.",
  },
  {
    num: "03",
    icon: Truck,
    title: "דן מאשר ושולח",
    text: "אישור זמינות בלייב, תשלום נוח בביט או העברה, ומשלוח מהיר לכל הארץ — או איסוף עצמי.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="font-display mb-2 text-[11px] tracking-[0.35em] text-gold/70 uppercase">
            HOW TO ORDER
          </p>
          <h2 className="text-gold-grad text-3xl font-black md:text-5xl">
            איך קונים אצל דן?
          </h2>
          <p className="mt-3 leading-7 text-white/55">
            שלושה צעדים פשוטים — והזהב שלכם. בלי קופה מסובכת, הכול עובר ישירות אליי בהודעה.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="glass-panel shine group relative overflow-hidden rounded-3xl p-7 transition-colors hover:border-gold/40"
            >
              <span className="font-display pointer-events-none absolute -top-4 end-4 text-[5rem] leading-none text-white/[0.05] transition-colors group-hover:text-gold/10">
                {s.num}
              </span>
              <span className="relative mb-5 grid h-13 w-13 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-goldlight">
                <s.icon size={22} />
              </span>
              <h3 className="relative mb-2 text-xl font-black">{s.title}</h3>
              <p className="relative text-sm leading-7 text-white/55">{s.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-gold/25 bg-gradient-to-l from-gold/12 via-transparent to-yam/10 p-6 md:flex-row md:p-8"
        >
          <p className="text-center text-lg font-extrabold md:text-start md:text-xl">
            מעדיפים לדבר עם בן אדם? <span className="text-gold-grad">אני זמין ממש עכשיו.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={waLink("היי דן! רציתי להתייעץ לפני הזמנה מהאתר.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-[#1faa53] to-[#25D366] px-6 py-3 font-black text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.5)] transition hover:scale-[1.03]"
            >
              <MessageCircle size={18} />
              וואטסאפ
            </a>
            <a
              href={`sms:${process.env.NEXT_PUBLIC_SMS_NUMBER || "+972500000000"}?&body=${encodeURIComponent("היי דן! רציתי להתייעץ לפני הזמנה מהאתר.")}`}
              className="inline-flex items-center gap-2 rounded-full border border-sky/50 bg-sky/10 px-6 py-3 font-bold text-sky-200 transition hover:bg-sky/20"
            >
              <MessageSquare size={17} />
              SMS
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
