import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { NotificationSettings } from "./notification-settings";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const user = await db().user.findUnique({
    where: { id: session.user.id },
    select: { notifyOnItemAdded: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <ProfileForm
        displayName={session.user.displayName ?? ""}
        email={session.user.email ?? ""}
      />
      <Separator />
      <NotificationSettings notifyOnItemAdded={user?.notifyOnItemAdded ?? true} />
    </div>
  );
}
