import Pokeball from "./Pokeball";

const ITEMS = [
  "בוסטרים אטומים",
  "הערצות בלייב",
  "פתיחות משותפות",
  "משלוח לכל הארץ",
  "מבצעים שבועיים",
  "קהילת TCG",
  "קלפים נדירים",
  "אחריות דן זהב",
];

export default function Marquee() {
  return (
    <div className="relative z-10 -my-4 overflow-hidden py-4">
      <div className="-rotate-1 border-y border-golddeep/40 bg-gradient-to-l from-[#8a6116] via-[#f5c542] to-[#8a6116] py-3 shadow-[0_10px_40px_-10px_rgba(245,197,66,0.5)]">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {ITEMS.map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-7 px-7 whitespace-nowrap text-base font-black tracking-wide text-[#2a1e03] md:text-lg"
                >
                  {t}
                  <Pokeball size={17} className="shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
