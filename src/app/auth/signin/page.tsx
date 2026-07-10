import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignInForm } from "./signin-form";
import { signInWithFacebook } from "./actions";

// Hidden while Facebook app verification/business-portfolio options are
// being decided — backend (provider config, action) stays in place.
const SHOW_FACEBOOK_LOGIN = false;

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
      <div className="flex w-full max-w-sm flex-col gap-4">
        <SignInForm />

        {SHOW_FACEBOOK_LOGIN && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form action={signInWithFacebook}>
              <Button
                type="submit"
                variant="outline"
                className="h-11 w-full gap-2 border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
              >
                <FacebookIcon className="size-4" />
                Continue with Facebook
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
