"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Crown,
  Gavel,
  MessageCircle,
  Radio,
  Trophy,
  X,
} from "lucide-react";
import type { Claim } from "@/db/schema";
import Countdown from "./Countdown";
import { ils } from "@/lib/format";
import { buildBidMessage, waLink } from "@/lib/constants";

function minBidOf(c: Claim) {
  return c.bidsCount > 0 ? c.currentBid + c.minIncrement : c.startPrice;
}

function isEffectivelyClosed(c: Claim) {
  if (c.status !== "live") return true;
  if (c.endsAt && new Date(c.endsAt).getTime() <= Date.now()) return true;
  return false;
}

export default function ClaimBoard({
  initialClaims,
  preview = false,
}: {
  initialClaims: Claim[];
  preview?: boolean;
}) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [selected, setSelected] = useState<Claim | null>(null);

  // light polling so the board feels live
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/claims", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { claims: Claim[] };
          setClaims(data.claims);
        }
      } catch {
        /* keep old data */
      }
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const shown = useMemo(() => {
    const sorted = [...claims].sort((a, b) => {
      const ca = isEffectivelyClosed(a) ? 1 : 0;
      const cb = isEffectivelyClosed(b) ? 1 : 0;
      return ca - cb || b.id - a.id;
    });
    return preview ? sorted.slice(0, 3) : sorted;
  }, [claims, preview]);

  if (shown.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center">
        <Gavel className="mx-auto mb-3 text-gold/60" size={32} />
        <p className="font-bold text-white/70">עוד אין מכירות פומביות פעילות — חוזרים אלינו בלייב הבא!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((c, i) => (
          <ClaimCard key={c.id} claim={c} index={i} onBid={() => setSelected(c)} />
        ))}
      </div>
      <BidModal
        claim={selected}
        onClose={() => setSelected(null)}
        onSuccess={(updated) =>
          setClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        }
      />
    </>
  );
}

function ClaimCard({
  claim,
  index,
  onBid,
}: {
  claim: Claim;
  index: number;
  onBid: () => void;
}) {
  const closed = isEffectivelyClosed(claim);
  const min = minBidOf(claim);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className={`shine group relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-b from-[#151531] to-[#0d0d22] transition-shadow duration-500 ${
        closed
          ? "border-white/8 opacity-75"
          : "border-gold/25 hover:border-gold/55 hover:shadow-[0_24px_70px_-20px_rgba(245,197,66,0.4)]"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={claim.image}
          alt={claim.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d22] via-transparent to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          {closed ? (
            <span className="chip !border-white/25 !bg-black/60 !text-white/70 backdrop-blur">
              <Trophy size={13} />
              הסתיימה
            </span>
          ) : (
            <span className="chip !border-red-400/60 !bg-red-500/20 !text-red-200 backdrop-blur">
              <span className="animate-live-dot h-2 w-2 rounded-full bg-red-400" />
              LIVE
            </span>
          )}
          <span className="chip !bg-night/70 backdrop-blur-sm">
            <Gavel size={13} />
            {claim.bidsCount} הצעות
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg leading-snug font-extrabold">{claim.title}</h3>
        {claim.description && (
          <p className="line-clamp-2 text-sm leading-6 text-white/50">{claim.description}</p>
        )}

        <div className="mt-auto space-y-3 border-t border-white/8 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-white/40">
                {closed ? "הצעת זכייה" : claim.bidsCount > 0 ? "הצעה נוכחית" : "מחיר פתיחה"}
              </p>
              <p className="text-gold-grad text-3xl font-black">
                {ils(claim.bidsCount > 0 ? claim.currentBid : claim.startPrice)}
              </p>
            </div>
            <Countdown
              endsAt={closed ? null : claim.endsAt}
              className="pb-1 text-sm font-bold text-white/60"
            />
          </div>

          {closed ? (
            claim.currentBidder ? (
              <div className="flex items-center gap-2 rounded-2xl border border-gold/30 bg-gold/8 px-4 py-3 text-sm">
                <Crown size={16} className="shrink-0 text-gold" />
                <span className="font-bold text-goldlight">
                  נקליים על ידי {claim.currentBidder} ב-{ils(claim.currentBid)}
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-bold text-white/50">
                המכירה הסתיימה ללא זוכה
              </div>
            )
          ) : (
            <div className="space-y-2">
              <button onClick={onBid} className="btn-gold w-full">
                <Gavel size={17} />
                הציבו הצעה — מינימום {ils(min)}
              </button>
              <a
                href={waLink(
                  buildBidMessage({
                    title: claim.title,
                    amount: min,
                    name: "(השם שלכם)",
                  }),
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/55 transition hover:border-emerald-400/50 hover:text-emerald-300"
              >
                <MessageCircle size={14} />
                מעדיפים לשלוח הצעה ידנית בוואטסאפ?
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function BidModal({
  claim,
  onClose,
  onSuccess,
}: {
  claim: Claim | null;
  onClose: () => void;
  onSuccess: (c: Claim) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // hydrate bidder + reset per claim
  useEffect(() => {
    if (claim) {
      try {
        const saved = localStorage.getItem("dg-bidder");
        if (saved) {
          const { name: n, phone: p } = JSON.parse(saved);
          setName(n || "");
          setPhone(p || "");
        }
      } catch {
        /* ignore */
      }
      setAmount(minBidOf(claim));
      setError(null);
      setDone(false);
    }
  }, [claim]);

  useEffect(() => {
    document.body.style.overflow = claim ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [claim]);

  const submit = async () => {
    if (!claim) return;
    if (!name.trim() || !phone.trim()) {
      setError("שם וטלפון חובה — ככה דן יודע מי קליים");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/claims/${claim.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "ההצעה לא התקבלה, נסו שוב");
        if (data?.min) setAmount(data.min);
        return;
      }
      try {
        localStorage.setItem("dg-bidder", JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      } catch {
        /* ignore */
      }
      onSuccess(data.claim as Claim);
      setDone(true);
    } catch {
      setError("תקלה ברשת — נסו שוב או שלחו בוואטסאפ");
    } finally {
      setBusy(false);
    }
  };

  const min = claim ? minBidOf(claim) : 0;

  return (
    <AnimatePresence>
      {claim && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <div className="glass-panel gold-border-glow relative w-full max-w-md rounded-3xl p-6">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="סגור"
              >
                <X size={16} />
              </button>

              {done ? (
                <div className="py-4 text-center">
                  <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <CheckCircle2 size={30} />
                  </span>
                  <h4 className="text-2xl font-black">ההצעה נקלטה!</h4>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    אתם מובילים עכשיו ב-{ils(amount)} על &quot;{claim.title}&quot;. אם עוקפים אתכם —
                    תהיו הראשונים לדעת בלייב.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <a
                      href={waLink(buildBidMessage({ title: claim.title, amount, name: name.trim() }))}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#1faa53] to-[#25D366] px-6 py-3 font-black text-white transition hover:scale-[1.02]"
                    >
                      <MessageCircle size={17} />
                      שלחו גם אישור בוואטסאפ
                    </a>
                    <button onClick={onClose} className="btn-ghost !py-2.5 text-sm">
                      סגירה
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-3 pe-10">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gold/30">
                      <Image src={claim.image} alt={claim.title} fill sizes="56px" className="object-cover" />
                    </span>
                    <div>
                      <h4 className="leading-tight font-black">{claim.title}</h4>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
                        <Radio size={12} className="text-red-400" />
                        מינימום להצעה: <span className="font-black text-goldlight">{ils(min)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input-dark"
                        placeholder="שם מלא *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <input
                        className="input-dark"
                        placeholder="טלפון *"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-white/50">
                        ההצעה שלכם (₪)
                      </label>
                      <input
                        className="input-dark font-display !text-lg tracking-wider"
                        type="number"
                        min={min}
                        step={claim.minIncrement}
                        value={amount || ""}
                        onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
                        dir="ltr"
                      />
                      <div className="mt-2 flex gap-2">
                        {[10, 25, 50].map((d) => (
                          <button
                            key={d}
                            onClick={() => setAmount((a) => Math.max(a || 0, min) + d)}
                            className="rounded-full border border-gold/30 bg-gold/8 px-3.5 py-1.5 text-xs font-black text-goldlight transition hover:bg-gold/20"
                          >
                            +{d}
                          </button>
                        ))}
                        <span className="ms-auto text-[11px] leading-5 text-white/35">
                          צעד מינימלי: {ils(claim.minIncrement)}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={submit}
                      disabled={busy || amount < min}
                      className="btn-gold w-full !py-3.5"
                    >
                      <Gavel size={17} />
                      {busy ? "מציבים..." : `אישור הצעה — ${ils(amount || 0)}`}
                    </button>
                    <p className="text-center text-[11px] text-white/40">
                      ההצעה נשמרת אצלנו ומחייבת — בדיוק כמו קריאה בלייב
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
