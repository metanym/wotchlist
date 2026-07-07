import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  if (session.user.displayName) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Wotchlist</h1>
        <p className="text-sm text-muted-foreground">
          What should we call you? This is shown to friends on shared lists.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <OnboardingForm />
      </div>
    </div>
  );
}
