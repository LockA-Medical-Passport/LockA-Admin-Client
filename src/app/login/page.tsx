import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata = {
  title: "Sign in — LockA Admin",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
