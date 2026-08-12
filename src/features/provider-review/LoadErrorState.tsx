"use client";

import { useRouter } from "next/navigation";
import { Button, EmptyState } from "@/components/ui";

/**
 * Rendered instead of throwing when locka-api is unreachable or errors: the admin keeps the
 * app shell and a retry, rather than being dropped onto an error page.
 */
export function LoadErrorState({ title, message }: { title: string; message: string }) {
  const router = useRouter();

  return (
    <div className="glass rounded-xl">
      <EmptyState
        title={title}
        description={message}
        action={
          <Button variant="secondary" onClick={() => router.refresh()}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
