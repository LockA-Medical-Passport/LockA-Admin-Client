import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function ProviderApplicationNotFound() {
  return (
    <div className="glass rounded-xl">
      <EmptyState
        title="Application not found"
        description="This provider application doesn't exist, or it has been removed from the queue."
        action={
          <Link
            href="/applications"
            className="rounded text-sm text-locka-cyan hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
          >
            Back to applications
          </Link>
        }
      />
    </div>
  );
}
