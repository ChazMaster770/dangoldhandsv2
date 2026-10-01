import type { ReactNode } from "react";

export default function SectionHead({
  kicker,
  title,
  sub,
  action,
}: {
  kicker: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="font-display mb-2 text-[11px] tracking-[0.35em] text-gold/70 uppercase">
          {kicker}
        </p>
        <h2 className="text-gold-grad text-3xl font-black md:text-5xl">{title}</h2>
        {sub && <p className="mt-3 leading-7 text-white/55">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
