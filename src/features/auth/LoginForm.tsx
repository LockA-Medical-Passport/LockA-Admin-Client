"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message ?? "Invalid email or password");
        return;
      }

      const redirectTo = searchParams.get("from") || "/";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-bright animate-slide-up flex w-full max-w-sm flex-col gap-5 rounded-2xl p-8"
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="glow-cyan flex size-10 items-center justify-center rounded-lg bg-locka-cyan/10 text-base font-bold text-locka-cyan">
          L
        </span>
        <h1 className="mt-2 text-lg font-semibold text-foreground">LockA Admin</h1>
        <p className="text-sm text-foreground/60">Sign in to review provider applications</p>
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
