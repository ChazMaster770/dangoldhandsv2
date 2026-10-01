import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MessageSquare, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { prettyWhatsApp, smsLink, waLink } from "@/lib/constants";
import Pokeball from "./Pokeball";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt="דן ידי זהב"
                width={52}
                height={52}
                className="rounded-full ring-2 ring-gold/50"
              />
              <div>
                <p className="text-gold-grad text-xl font-black">דן ידי זהב</p>
                <p className="font-display text-[10px] tracking-[0.28em] text-white/40">
                  DAN GOLD HANDS TCG
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">
              חנות פוקימון TCG ולייבים: בוסטר בוקסים אטומים, חבילות, קלפים נדירים
              והערצות — עם ידי הזהב של דן ואחריות מלאה על כל חבילה.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={waLink("היי דן! הגעתי מהאתר.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-4 py-2 text-sm font-bold text-[#57e389] ring-1 ring-[#25D366]/40 transition hover:bg-[#25D366]/25"
              >
                <MessageCircle size={15} />
                {prettyWhatsApp()}
              </a>
              <a
                href={smsLink("היי דן! הגעתי מהאתר.")}
                className="inline-flex items-center gap-2 rounded-full bg-sky/10 px-4 py-2 text-sm font-bold text-sky-300 ring-1 ring-sky/30 transition hover:bg-sky/20"
              >
                <MessageSquare size={15} />
                שליחת SMS
              </a>
            </div>
          </div>

          {/* links */}
          <div>
            <p className="font-display mb-4 text-[11px] tracking-[0.3em] text-gold/70">
              NAVIGATION
            </p>
            <ul className="space-y-2.5 text-sm font-bold text-white/60">
              <li><Link href="/" className="transition hover:text-goldlight">בית</Link></li>
              <li><Link href="/shop" className="transition hover:text-goldlight">החנות</Link></li>
              <li><Link href="/claims" className="transition hover:text-goldlight">הערצות בלייב</Link></li>
              <li><Link href="/#how" className="transition hover:text-goldlight">איך קונים</Link></li>
              <li><Link href="/admin" className="text-white/35 transition hover:text-goldlight">כניסת ניהול</Link></li>
            </ul>
          </div>

          {/* promises */}
          <div>
            <p className="font-display mb-4 text-[11px] tracking-[0.3em] text-gold/70">
              WHY GOLD HANDS
            </p>
            <ul className="space-y-3.5 text-sm text-white/60">
              <li className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="shrink-0 text-gold" />
                100% מוצרים מקוריים ואטומים
              </li>
              <li className="flex items-center gap-2.5">
                <Truck size={16} className="shrink-0 text-gold" />
                משלוח מהיר לכל הארץ או איסוף
              </li>
              <li className="flex items-center gap-2.5">
                <BadgeCheck size={16} className="shrink-0 text-gold" />
                אחריות דן על כל קלף שיוצא
              </li>
              <li className="flex items-center gap-2.5">
                <Pokeball size={16} className="shrink-0" />
                פתיחות והערצות בלייב כל שבוע
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/8 pt-6">
          <p className="text-center text-xs text-white/40">
            © 2026 דן ידי זהב • DAN GOLD HANDS — כל הזכויות שמורות
          </p>
        </div>
      </div>
    </footer>
  );
}
