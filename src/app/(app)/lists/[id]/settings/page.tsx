import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SettingsView } from "./settings-view";

export default async function ListSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const membership = await db().listMember.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });
  if (!membership) notFound();
  if (membership.role !== "OWNER") redirect(`/lists/${id}`);

  const list = await db().list.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!list) notFound();

  return <SettingsView list={list} currentUserId={session.user.id} />;
}
