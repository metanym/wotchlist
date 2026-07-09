import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "There's a configuration problem with sign-in. If you just tried Facebook, it may need a permission enabled on the Facebook app's side.",
  AccessDenied: "Access was denied, so we couldn't sign you in.",
  Verification: "That sign-in link is invalid or has expired. Request a new one.",
  OAuthSignin: "Something went wrong starting that sign-in method. Please try again.",
  OAuthCallback: "Something went wrong completing that sign-in. Please try again.",
  OAuthCreateAccount: "We couldn't create an account from that sign-in. Please try again.",
  OAuthAccountNotLinked:
    "That email is already used by a different sign-in method. Try signing in the way you originally did.",
  EmailSignin: "We couldn't send the sign-in email. Please try again.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = (error && ERROR_MESSAGES[error]) || ERROR_MESSAGES.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <AlertTriangle className="size-10 text-muted-foreground" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Sign-in error</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
      <Button asChild size="lg" className="h-11 px-8">
        <Link href="/auth/signin">Back to sign in</Link>
      </Button>
    </div>
  );
}
