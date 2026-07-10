import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { NotificationSettings } from "./notification-settings";

const OWNER_EMAIL = "jonwilliams1964@gmail.com";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const user = await db().user.findUnique({
    where: { id: session.user.id },
    select: { notifyOnItemAdded: true },
  });

  const isOwner = session.user.email === OWNER_EMAIL;
  const stats = isOwner
    ? await Promise.all([
        db().user.count(),
        db().list.count(),
        db().list.count({ where: { type: "SHARED" } }),
        db().listItem.count(),
      ]).then(([users, lists, sharedLists, items]) => ({ users, lists, sharedLists, items }))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <ProfileForm
        displayName={session.user.displayName ?? ""}
        email={session.user.email ?? ""}
      />
      <Separator />
      <NotificationSettings notifyOnItemAdded={user?.notifyOnItemAdded ?? true} />

      {stats && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Overview</h2>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Users" value={stats.users} />
              <StatTile label="Lists" value={stats.lists} />
              <StatTile label="Shared lists" value={stats.sharedLists} />
              <StatTile label="Items added" value={stats.items} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border p-3">
      <span className="text-xl font-semibold tracking-tight">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
