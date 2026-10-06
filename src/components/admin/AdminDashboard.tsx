"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Crown,
  Gavel,
  LogOut,
  Minus,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
  ClipboardList,
  Star,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import type { Claim, Order, Product } from "@/db/schema";
import { IMAGE_CHOICES } from "@/lib/images";
import { PRODUCT_KINDS } from "@/lib/kinds";
import { formatDate, ils, kindLabel, orderStatusLabel } from "@/lib/format";
import ImageField from "./ImageField";

type Tab = "products" | "claims" | "orders";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "products", label: "מוצרים", icon: Package },
  { key: "claims", label: "מכירות פומביות", icon: Gavel },
  { key: "orders", label: "הזמנות", icon: ClipboardList },
];

export default function AdminDashboard({
  initialProducts,
  initialClaims,
  initialOrders,
}: {
  initialProducts: Product[];
  initialClaims: Claim[];
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState(initialProducts);
  const [claims, setClaims] = useState(initialClaims);
  const [orders, setOrders] = useState(initialOrders);

  const refresh = async () => {
    try {
      const [p, c, o] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/claims", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/orders", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setProducts(p.products ?? []);
      setClaims(c.claims ?? []);
      setOrders(o.orders ?? []);
    } catch {
      /* ignore */
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-[11px] tracking-[0.3em] text-gold/70">CONTROL ROOM</p>
          <h1 className="text-gold-grad text-3xl font-black md:text-4xl">ניהול החנות</h1>
          <p className="mt-1 text-sm text-white/45">שלום דן — ידי הזהב על ההגה</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden gap-4 rounded-full border border-white/10 px-5 py-2 text-xs text-white/55 sm:flex">
            <span><b className="text-goldlight">{products.length}</b> מוצרים</span>
            <span><b className="text-goldlight">{claims.filter((c) => c.status === "live").length}</b> מכירות live</span>
            <span><b className="text-goldlight">{orders.filter((o) => o.status === "new").length}</b> הזמנות חדשות</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
          >
            <LogOut size={15} />
            יציאה
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mb-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition-all ${
              tab === t.key
                ? "bg-gradient-to-l from-goldlight to-gold text-[#241a02]"
                : "border border-white/12 text-white/60 hover:border-gold/40 hover:text-goldlight"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab products={products} refresh={refresh} />}
      {tab === "claims" && <ClaimsTab claims={claims} refresh={refresh} />}
      {tab === "orders" && <OrdersTab orders={orders} refresh={refresh} />}
    </div>
  );
}

/* ---------------- products ---------------- */

const EMPTY_PRODUCT_FORM = {
  name: "",
  setName: "",
  kind: "pack",
  price: "",
  compareAt: "",
  image: IMAGE_CHOICES[0].src as string,
  stock: "10",
  badge: "",
  description: "",
  featured: false,
};

function ProductsTab({ products, refresh }: { products: Product[]; refresh: () => Promise<void> }) {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const payload = () => ({
    name: form.name,
    setName: form.setName,
    kind: form.kind,
    price: Number(form.price),
    compareAt: form.compareAt === "" ? null : Number(form.compareAt),
    image: form.image,
    stock: Number(form.stock),
    badge: form.badge,
    description: form.description,
    featured: form.featured,
  });

  const resetForm = () => {
    setForm(EMPTY_PRODUCT_FORM);
    setEditingId(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = editingId
      ? await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload()),
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload()),
        });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "שגיאה בשמירה");
    } else {
      resetForm();
      await refresh();
    }
    setBusy(false);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      setName: p.setName ?? "",
      kind: p.kind,
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      image: p.image,
      stock: String(p.stock),
      badge: p.badge ?? "",
      description: p.description ?? "",
      featured: p.featured,
    });
    setEditingId(p.id);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const patch = async (id: number, body: Record<string, unknown>) => {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("למחוק את המוצר לצמיתות?")) return;
    if (editingId === id) resetForm();
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      {/* add / edit form */}
      <form ref={formRef} onSubmit={submit} className="glass-panel h-max scroll-mt-24 space-y-3 rounded-3xl p-6">
        <h3 className="flex items-center gap-2 text-lg font-black">
          {editingId ? <Pencil size={18} className="text-gold" /> : <Plus size={18} className="text-gold" />}
          {editingId ? `עריכת מוצר #${editingId}` : "הוספת מוצר חדש"}
          {editingId && (
            <button type="button" onClick={resetForm} className="ms-auto inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/50 transition hover:text-white">
              <X size={12} />
              ביטול עריכה
            </button>
          )}
        </h3>
        <input className="input-dark" placeholder="שם המוצר *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input-dark" placeholder="שם סדרה באנגלית (אופציונלי)" value={form.setName} onChange={(e) => setForm({ ...form, setName: e.target.value })} dir="ltr" />
        <div className="grid grid-cols-2 gap-2">
          <select className="input-dark cursor-pointer" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            {PRODUCT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <input className="input-dark" placeholder="מלאי" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className="input-dark" placeholder="מחיר ₪ *" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="input-dark" placeholder="מחיר לפני (אופציונלי)" type="number" min={1} value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: e.target.value })} />
        </div>
        <input className="input-dark" placeholder="תגית: חדש / חם / נדיר (אופציונלי)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        <textarea className="input-dark min-h-20 resize-y" placeholder="תיאור קצר" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <ImageField value={form.image} onChange={(src) => setForm({ ...form, image: src })} />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-white/70">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#f5c542]" />
          מוצר מומלץ (יופיע בדף הבית)
        </label>
        {error && <p className="text-xs font-bold text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? "שומר..." : editingId ? "שמירת שינויים" : "הוספה לחנות"}
        </button>
      </form>

      {/* list */}
      <div className="space-y-3">
        {products.length === 0 && (
          <div className="glass-panel rounded-3xl p-10 text-center text-white/50">
            עוד אין מוצרים — מוסיפים בטופס מצד ימין
          </div>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className={`glass-panel flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors ${
              editingId === p.id ? "border-gold/70 shadow-[0_0_0_3px_rgba(245,197,66,0.15)]" : ""
            }`}
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="64px" unoptimized />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{p.name}</p>
              <p className="text-xs text-white/45">
                {kindLabel(p.kind)} • {ils(p.price)}
                {p.compareAt ? ` (לפני ${ils(p.compareAt)})` : ""}
                {p.badge ? ` • ${p.badge}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/50">מלאי:</span>
              <button onClick={() => patch(p.id, { stock: Math.max(0, p.stock - 1) })} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/60 hover:border-gold/50 hover:text-goldlight" aria-label="הורדת מלאי">
                <Minus size={13} />
              </button>
              <span className={`w-8 text-center font-black ${p.stock === 0 ? "text-red-400" : p.stock <= 3 ? "text-goldlight" : ""}`}>
                {p.stock}
              </span>
              <button onClick={() => patch(p.id, { stock: p.stock + 1 })} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/60 hover:border-gold/50 hover:text-goldlight" aria-label="הוספת מלאי">
                <Plus size={13} />
              </button>
            </div>
            <button
              onClick={() => startEdit(p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky/40 bg-sky/10 px-3.5 py-2 text-xs font-black text-sky-200 transition hover:bg-sky/20"
              title="עריכת המוצר"
            >
              <Pencil size={13} />
              עריכה
            </button>
            <button
              onClick={() => patch(p.id, { featured: !p.featured })}
              className={`grid h-9 w-9 place-items-center rounded-full border transition ${p.featured ? "border-gold/60 bg-gold/15 text-goldlight" : "border-white/15 text-white/40 hover:text-goldlight"}`}
              title={p.featured ? "הסרה מהמומלצים" : "סימון כמומלץ"}
            >
              <Star size={15} fill={p.featured ? "currentColor" : "none"} />
            </button>
            <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/40 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300" aria-label="מחיקה">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- claims ---------------- */

function ClaimsTab({ claims, refresh }: { claims: Claim[]; refresh: () => Promise<void> }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: IMAGE_CHOICES[6].src as string,
    startPrice: "",
    minIncrement: "10",
    endsAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "שגיאה בשמירה");
    } else {
      setForm({ ...form, title: "", description: "", startPrice: "" });
      await refresh();
    }
    setBusy(false);
  };

  const patch = async (id: number, body: Record<string, unknown>) => {
    await fetch(`/api/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("למחוק את המכירה הפומבית וכל ההצעות שלה?")) return;
    await fetch(`/api/claims/${id}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="glass-panel h-max space-y-3 rounded-3xl p-6">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <Gavel size={18} className="text-gold" />
          מכירה פומבית חדשה
        </h3>
        <input className="input-dark" placeholder="כותרת המכירה הפומבית *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input-dark min-h-20 resize-y" placeholder="תיאור (אופציונלי)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input-dark" placeholder="מחיר פתיחה ₪ *" type="number" min={1} value={form.startPrice} onChange={(e) => setForm({ ...form, startPrice: e.target.value })} />
          <input className="input-dark" placeholder="צעד מינימלי ₪" type="number" min={1} value={form.minIncrement} onChange={(e) => setForm({ ...form, minIncrement: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-white/50">סיום (ריק = מסתיים בלייב)</label>
          <input type="datetime-local" className="input-dark" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </div>
        <ImageField value={form.image} onChange={(src) => setForm({ ...form, image: src })} />
        {error && <p className="text-xs font-bold text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? "פותח..." : "פתיחת מכירה פומבית"}
        </button>
      </form>

      <div className="space-y-3">
        {claims.length === 0 && (
          <div className="glass-panel rounded-3xl p-10 text-center text-white/50">
            אין מכירות פומביות — פותחים אחת בטופס מצד ימין
          </div>
        )}
        {claims.map((c) => (
          <div key={c.id} className="glass-panel flex flex-wrap items-center gap-4 rounded-2xl p-4">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <Image src={c.image} alt={c.title} fill className="object-cover" sizes="64px" unoptimized />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-black">
                {c.title}
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${c.status === "live" ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/50"}`}>
                  {c.status === "live" ? "LIVE" : "נסגרה"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-white/45">
                {c.bidsCount} הצעות • עומד על {ils(c.bidsCount > 0 ? c.currentBid : c.startPrice)}
                {c.currentBidder && (
                  <span className="text-goldlight"> • מוביל: {c.currentBidder}</span>
                )}
                {c.endsAt && <span> • סיום: {formatDate(c.endsAt)}</span>}
              </p>
            </div>
            {c.status === "live" ? (
              <button onClick={() => patch(c.id, { status: "closed" })} className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-black text-goldlight transition hover:bg-gold/20">
                <Crown size={14} />
                סגירה והכרזת זוכה
              </button>
            ) : (
              <button onClick={() => patch(c.id, { status: "live" })} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/50 transition hover:border-gold/40 hover:text-goldlight">
                פתיחה מחדש
              </button>
            )}
            <button onClick={() => remove(c.id)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/40 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300" aria-label="מחיקה">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- orders ---------------- */

const ORDER_STATUSES = ["new", "confirmed", "shipped", "done"] as const;

function OrdersTab({ orders, refresh }: { orders: Order[]; refresh: () => Promise<void> }) {
  const setStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
  };

  const statusColor = (s: string) =>
    s === "new"
      ? "border-gold/50 text-goldlight"
      : s === "confirmed"
        ? "border-sky/50 text-sky-300"
        : s === "shipped"
          ? "border-yam/50 text-violet-300"
          : "border-emerald-400/50 text-emerald-300";

  return (
    <div className="space-y-3">
      {orders.length === 0 && (
        <div className="glass-panel rounded-3xl p-10 text-center text-white/50">
          עוד לא נכנסו הזמנות מהאתר — בקרוב יתחילו לזרום
        </div>
      )}
      {orders.map((o) => (
        <div key={o.id} className="glass-panel rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-sm tracking-wider text-goldlight">#{o.id}</span>
              <span className="font-black">{o.name}</span>
              {o.phone && <span className="text-sm text-white/50" dir="ltr">{o.phone}</span>}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ${o.channel === "whatsapp" ? "bg-[#25D366]/15 text-[#57e389]" : "bg-sky/15 text-sky-300"}`}>
                {o.channel === "whatsapp" ? <MessageCircle size={12} /> : <MessageSquare size={12} />}
                {o.channel === "whatsapp" ? "וואטסאפ" : "SMS"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold-grad text-xl font-black">{ils(o.total)}</span>
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className={`cursor-pointer rounded-full border bg-transparent px-3 py-1.5 text-xs font-black outline-none ${statusColor(o.status)}`}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0c0c24]">
                    {orderStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 space-y-1 border-t border-white/8 pt-3 text-sm text-white/60">
            {o.items.map((i, idx) => (
              <p key={idx}>
                • {i.name} ({kindLabel(i.kind)}) × {i.qty} — {ils(i.price * i.qty)}
              </p>
            ))}
            {o.note && <p className="pt-1 text-white/40">הערות: {o.note}</p>}
            <p className="pt-1 text-[11px] text-white/30">{formatDate(o.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
