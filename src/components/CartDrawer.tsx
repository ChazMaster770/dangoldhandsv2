"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  MessageSquare,
  Minus,
  PartyPopper,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildOrderMessage, smsLink, waLink } from "@/lib/constants";
import { ils, kindLabel } from "@/lib/format";
import Pokeball from "./Pokeball";

type SendState = "idle" | "sending" | "sent" | "error";

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, total, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setState("idle");
      setTouched(false);
    }
  }, [isOpen]);

  const send = async (channel: "whatsapp" | "sms") => {
    if (!name.trim()) {
      setTouched(true);
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          note: note.trim() || null,
          channel,
          items: items.map(({ id, name, kind, price, qty }) => ({
            id,
            name,
            kind,
            price,
            qty,
          })),
          total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const orderId: number | undefined = data?.order?.id;
      const msg = buildOrderMessage({
        name: name.trim(),
        phone: phone.trim() || undefined,
        note: note.trim() || undefined,
        items,
        total,
        orderId,
      });
      const url = channel === "whatsapp" ? waLink(msg) : smsLink(msg);
      window.open(url, "_blank", "noopener");
      setState("sent");
      clear();
    } catch {
      setState("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col border-e border-gold/20 bg-[#0c0c24] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            dir="rtl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/12 text-goldlight">
                  <ShoppingBag size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-black">הסל שלכם</h3>
                  <p className="text-xs text-white/45">
                    ההזמנה נשלחת לדן כהודעה מוכנה — וואטסאפ או SMS
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="סגור"
              >
                <X size={16} />
              </button>
            </div>

            {state === "sent" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gold/12 text-goldlight">
                  <PartyPopper size={34} />
                </span>
                <h4 className="text-2xl font-black">ההזמנה בדרך לדן!</h4>
                <p className="text-sm leading-6 text-white/55">
                  נפתח לכם חלון עם ההודעה המוכנה — פשוט לוחצים שליחה. דן יחזור אליכם
                  לאישור זמינות, תשלום ומשלוח.
                </p>
                <button onClick={closeCart} className="btn-gold mt-2">
                  המשך קנייה
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <Pokeball size={64} className="animate-floaty" />
                <h4 className="text-2xl font-black">הסל ריק</h4>
                <p className="text-sm text-white/50">
                  עדיין לא תפסתם כלום — בחנות מחכים מארזים, בוסטר בוקס, איטיבי וחבילות עם מזל בפנים.
                </p>
                <a href="/shop" onClick={closeCart} className="btn-gold">
                  לחנות
                </a>
              </div>
            ) : (
              <>
                {/* items */}
                <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {items.map((i) => (
                    <div
                      key={i.id}
                      className="glass-panel flex items-center gap-3 rounded-2xl p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                        <Image src={i.image} alt={i.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{i.name}</p>
                        <p className="text-xs text-white/45">
                          {kindLabel(i.kind)} • {ils(i.price)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex items-center rounded-full border border-white/12">
                            <button
                              onClick={() => setQty(i.id, i.qty - 1)}
                              className="grid h-7 w-7 place-items-center text-white/60 hover:text-goldlight"
                              aria-label="הורד כמות"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm font-black">{i.qty}</span>
                            <button
                              onClick={() => setQty(i.id, i.qty + 1)}
                              className="grid h-7 w-7 place-items-center text-white/60 hover:text-goldlight"
                              aria-label="הוסף כמות"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-gold-grad text-sm font-black">
                            {ils(i.price * i.qty)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => remove(i.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/35 transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label="הסר"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* checkout */}
                <div className="space-y-3 border-t border-white/8 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/60">סה״כ לתשלום</span>
                    <span className="text-gold-grad text-2xl font-black">{ils(total)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={`input-dark ${touched && !name.trim() ? "!border-red-400/70" : ""}`}
                      placeholder="שם מלא *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="input-dark"
                      placeholder="טלפון (אופציונלי)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <input
                    className="input-dark"
                    placeholder="הערות להזמנה (אופציונלי)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  {touched && !name.trim() && (
                    <p className="text-xs font-bold text-red-400">כותבים שם וזהו — מוכן לשליחה</p>
                  )}
                  {state === "error" && (
                    <p className="text-xs font-bold text-red-400">
                      משהו נתקע — אפשר לנסות שוב או לכתוב לדן ישירות בוואטסאפ
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button
                      onClick={() => send("whatsapp")}
                      disabled={state === "sending"}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#1faa53] to-[#25D366] px-6 py-3.5 font-black text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.5)] transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      <MessageCircle size={19} />
                      {state === "sending" ? "שולח..." : "שליחת הזמנה בוואטסאפ"}
                    </button>
                    <button
                      onClick={() => send("sms")}
                      disabled={state === "sending"}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-sky/50 bg-sky/10 px-6 py-3 font-bold text-sky-200 transition hover:bg-sky/20 disabled:opacity-60"
                    >
                      <MessageSquare size={17} />
                      שליחת הזמנה ב-SMS
                    </button>
                    <p className="pt-1 text-center text-[11px] text-white/40">
                      נפתחת הודעה מוכנה עם כל הפרטים — נשאר רק ללחוץ שלח
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
