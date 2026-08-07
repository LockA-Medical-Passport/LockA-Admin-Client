import { Button } from "@/components/ui/Button";

export interface NavbarProps {
  onMenuClick?: () => void;
  adminName?: string;
  walletAddress?: string;
  onLogout?: () => void;
}

function truncateAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export function Navbar({ onMenuClick, adminName, walletAddress, onLogout }: NavbarProps) {
  const identity = adminName ?? (walletAddress ? truncateAddress(walletAddress) : undefined);

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-md p-1.5 text-foreground/70 hover:bg-white/5 hover:text-foreground md:hidden"
      >
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {identity ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800/60 px-3 py-1.5">
            <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
            <span className="font-mono text-xs text-foreground/80">{identity}</span>
          </div>
        ) : (
          <span className="text-xs text-foreground/40">Not signed in</span>
        )}
        {onLogout && (
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Log out
          </Button>
        )}
      </div>
    </header>
  );
}
