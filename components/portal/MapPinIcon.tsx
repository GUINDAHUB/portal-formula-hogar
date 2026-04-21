/** Icono estático (RSC) — evita Phosphor en servidor. */
export function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden
    >
      <path d="M128 16a64 64 0 0 0-64 64c0 52 64 120 64 120s64-68 64-120a64 64 0 0 0-64-64Zm0 88a24 24 0 1 1 24-24 24 24 0 0 1-24 24Z" />
    </svg>
  );
}
