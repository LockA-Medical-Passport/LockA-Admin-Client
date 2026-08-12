"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { DecisionModal } from "./DecisionModal";
import { DECISION_COPY, availableDecisions, decisionLabel, type DecisionAction } from "./status";
import type { ProviderApplication } from "./types";

export function ProviderActions({ provider }: { provider: ProviderApplication }) {
  const router = useRouter();
  const [action, setAction] = useState<DecisionAction | null>(null);
  const actions = availableDecisions(provider.status);

  if (actions.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        This provider is revoked — no further registry actions are available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((candidate) => (
        <Button
          key={candidate}
          variant={DECISION_COPY[candidate].buttonVariant}
          onClick={() => setAction(candidate)}
        >
          {decisionLabel(candidate, provider.status)}
        </Button>
      ))}

      <DecisionModal
        key={action ?? "closed"}
        provider={provider}
        action={action}
        onClose={() => setAction(null)}
        onDecided={() => {
          setAction(null);
          // Re-renders the server component so status, history and on-chain state all reflect
          // the decision rather than being patched piecemeal on the client.
          router.refresh();
        }}
      />
    </div>
  );
}
