"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface NavbarProps {
  onMenuClick?: () => void;
  adminName?: string;
  walletAddress?: string;
  walletConnecting?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  onLogout?: () => void | Promise<void>;
}

function truncateAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export function Navbar({
  onMenuClick,
  adminName,
  walletAddress,
  walletConnecting = false,
  onConnectWallet,
  onDisconnectWallet,
  onLogout,
}: NavbarProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (!onLogout) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

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
        {walletAddress ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800/60 px-3 py-1.5">
            <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
            <span className="font-mono text-xs text-foreground/80">
              {truncateAddress(walletAddress)}
            </span>
            {onDisconnectWallet && (
              <button
                type="button"
                onClick={onDisconnectWallet}
                aria-label="Disconnect wallet"
                className="text-foreground/40 hover:text-foreground"
              >
                <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5 5 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          onConnectWallet && (
            <Button
              variant="secondary"
              size="sm"
              loading={walletConnecting}
              onClick={onConnectWallet}
            >
              Connect Wallet
            </Button>
          )
        )}

        {adminName && (
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-navy-800/60 px-3 py-1.5 sm:flex">
            <span className="text-xs text-foreground/80">{adminName}</span>
          </div>
        )}

        {onLogout && (
          <Button variant="secondary" size="sm" loading={loggingOut} onClick={handleLogout}>
            Log out
          </Button>
        )}
      </div>
    </header>
  );
}
