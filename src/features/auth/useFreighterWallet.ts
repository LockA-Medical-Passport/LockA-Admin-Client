"use client";

import { useCallback, useState } from "react";
import { toast } from "@/components/ui";
import { errorMessage } from "@/lib/utils";
import { connectFreighter, signFreighterTransaction } from "./freighter";

export type WalletStatus = "idle" | "connecting" | "connected";

export type SignTransactionResult = { ok: true; signedXdr: string } | { ok: false; error: string };

export interface FreighterWallet {
  publicKey: string | null;
  status: WalletStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Requests a Freighter signature for a transaction built against this app's configured network. */
  signTransaction: (unsignedXdr: string) => Promise<SignTransactionResult>;
}

export function useFreighterWallet(): FreighterWallet {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("idle");

  const connect = useCallback(async () => {
    setStatus("connecting");
    try {
      const result = await connectFreighter();

      if (result.notInstalled) {
        toast.error(
          "Freighter extension not detected. Install it from freighter.app to connect a wallet.",
          { title: "Wallet not found" },
        );
        setStatus("idle");
        return;
      }

      if (result.error || !result.address) {
        toast.error(result.error ?? "Freighter did not return a wallet address.", {
          title: "Wallet connection failed",
        });
        setStatus("idle");
        return;
      }

      setPublicKey(result.address);
      setStatus("connected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to connect to Freighter", {
        title: "Wallet connection failed",
      });
      setStatus("idle");
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setStatus("idle");
  }, []);

  const signTransaction = useCallback(
    async (unsignedXdr: string): Promise<SignTransactionResult> => {
      if (!publicKey) return { ok: false, error: "Connect your wallet first." };

      try {
        const result = await signFreighterTransaction(unsignedXdr, publicKey);
        if (result.error || !result.signedXdr) {
          return {
            ok: false,
            error: result.error ?? "Freighter did not return a signed transaction.",
          };
        }
        return { ok: true, signedXdr: result.signedXdr };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    },
    [publicKey],
  );

  return { publicKey, status, connect, disconnect, signTransaction };
}
