import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Wotchlist needs a connection to load your lists. Check your network and try again.
      </p>
    </div>
  );
}
