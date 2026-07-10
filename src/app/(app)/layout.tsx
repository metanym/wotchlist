import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-shell/app-header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { getUnreadNotificationCount } from "@/app/(app)/notifications/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  if (!session.user.displayName) {
    redirect("/auth/onboarding");
  }

  const unreadCount = await getUnreadNotificationCount();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={session.user} initialUnreadCount={unreadCount} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
