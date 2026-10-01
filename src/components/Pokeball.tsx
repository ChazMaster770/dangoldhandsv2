export default function Pokeball({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <circle cx="24" cy="24" r="22" fill="#ef3f4e" />
      <path d="M2 24a22 22 0 0 0 44 0z" fill="#f8fafc" />
      <rect x="2" y="21.5" width="44" height="5" fill="#0f172a" />
      <circle cx="24" cy="24" r="7.5" fill="#0f172a" />
      <circle cx="24" cy="24" r="4.2" fill="#f8fafc" />
      <circle cx="24" cy="24" r="2" fill="#cbd5e1" />
      <ellipse cx="16" cy="13" rx="7" ry="4" fill="#ffffff" opacity="0.35" transform="rotate(-25 16 13)" />
    </svg>
  );
}
