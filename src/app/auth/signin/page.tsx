import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "./signin-form";

export default async function SignInPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Wotchlist</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a sign-in link.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}
