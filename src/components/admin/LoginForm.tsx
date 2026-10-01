"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "סיסמה לא נכונה");
        return;
      }
      // Full navigation guarantees the session cookie is picked up.
      window.location.assign("/admin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-panel gold-border-glow w-full max-w-sm rounded-3xl p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Image
          src="/images/logo.jpg"
          alt="דן ידי זהב"
          width={84}
          height={84}
          className="rounded-full ring-2 ring-gold/50"
        />
        <h1 className="text-gold-grad mt-4 text-2xl font-black">כניסת ניהול</h1>
        <p className="mt-1 text-sm text-white/45">אזור פרטי לדן בלבד — ידי זהב בלבד</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          className="input-dark text-center"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-center text-xs font-bold text-red-400">{error}</p>}
        <button type="submit" disabled={busy || !password} className="btn-gold w-full">
          <Lock size={16} />
          {busy ? "בודק..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
