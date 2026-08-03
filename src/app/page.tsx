export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">LockA Admin Client</h1>
      <p className="max-w-md text-sm text-foreground/70">
        Scaffold in progress — see{" "}
        <a
          href="https://github.com/LockA-Medical-Passport/LockA-Admin-Client/issues"
          className="text-locka-cyan hover:underline"
        >
          open issues
        </a>{" "}
        for what&apos;s being built next.
      </p>
    </div>
  );
}
