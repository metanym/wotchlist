import { MailCheck } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <MailCheck className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Check your email</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        We&apos;ve sent you a sign-in link. Click it to continue to Wotchlist.
      </p>
    </div>
  );
}
