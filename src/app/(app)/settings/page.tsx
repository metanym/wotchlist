import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <ProfileForm
        displayName={session.user.displayName ?? ""}
        email={session.user.email ?? ""}
      />
    </div>
  );
}
