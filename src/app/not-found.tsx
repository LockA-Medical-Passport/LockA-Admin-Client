import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="glow-cyan flex size-14 items-center justify-center rounded-2xl bg-locka-cyan/10 text-locka-cyan">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex max-w-md flex-col gap-2">
        <p className="font-mono text-xs tracking-[0.3em] text-locka-cyan uppercase">404</p>
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-foreground/60">
          The page you were looking for doesn&apos;t exist, moved, or you may not have access to it.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-locka-blue px-4 text-sm font-medium text-white transition-colors hover:bg-locka-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
      >
        Return to dashboard
      </Link>
    </main>
  );
}
