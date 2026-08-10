"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useFreighterWallet, type FreighterWallet } from "./useFreighterWallet";

const WalletContext = createContext<FreighterWallet | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useFreighterWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWallet(): FreighterWallet {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}
