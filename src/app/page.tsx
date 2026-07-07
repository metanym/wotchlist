import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Clapperboard } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <Clapperboard className="size-12 text-foreground" />
        <h1 className="text-3xl font-semibold tracking-tight">Wotchlist</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Track what to watch across all your streaming services — with friends.
        </p>
      </div>
      <Button asChild size="lg" className="h-11 px-8">
        <Link href="/auth/signin">Sign in</Link>
      </Button>
    </div>
  );
}
