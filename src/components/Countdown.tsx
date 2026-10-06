"use client";

import { useEffect, useState } from "react";
import { Radio, Timer } from "lucide-react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown({
  endsAt,
  className = "",
}: {
  endsAt: string | Date | null;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!endsAt) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-red-300 ${className}`}>
        <Radio size={14} className="animate-glow-pulse" />
        מסתיים בלייב
      </span>
    );
  }

  const end = new Date(endsAt).getTime();
  if (now === null) {
    return <span className={className}>—</span>;
  }
  const diff = end - now;
  if (diff <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-white/50 ${className}`}>
        <Timer size={14} />
        המכירה הסתיימה
      </span>
    );
  }

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} dir="ltr">
      <Timer size={14} className="text-goldlight" />
      {d > 0 && <span>{d} ימים •</span>}
      <span className="font-display tracking-wider">
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </span>
  );
}
