/**
 * ClassEcon wordmark icon: ledger lines (class workflow) + ring (classroom credits / economy).
 * Renders via currentColor for header, footer, or favicon-style uses.
 */
export function LogoMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3.5" y="7" width="11.5" height="3" rx="1.5" fill="currentColor" />
      <rect x="3.5" y="13" width="13.5" height="3" rx="1.5" fill="currentColor" />
      <rect x="3.5" y="19" width="9.5" height="3" rx="1.5" fill="currentColor" />
      <circle cx="22.75" cy="14.5" r="7.25" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="19.85" cy="11.85" r="1.35" fill="currentColor" />
    </svg>
  );
}
