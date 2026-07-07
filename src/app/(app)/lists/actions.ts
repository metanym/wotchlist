"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getMembership } from "@/lib/lists";
import type { ListType } from "@prisma/client";

export async function createList(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "PERSONAL") as ListType;

  if (!name) {
    return { error: "Give your list a name." };
  }

  const list = await db().list.create({
    data: {
      name,
      description,
      type,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  revalidatePath("/lists");
  redirect(`/lists/${list.id}`);
}

export async function renameList(listId: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const membership = await getMembership(listId, session.user.id);
  if (membership?.role !== "OWNER") {
    return { error: "Only the owner can edit this list." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) {
    return { error: "Give your list a name." };
  }

  await db().list.update({
    where: { id: listId },
    data: { name, description },
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
  return { success: true };
}

export async function deleteList(listId: string) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const membership = await getMembership(listId, session.user.id);
  if (membership?.role !== "OWNER") {
    return { error: "Only the owner can delete this list." };
  }

  await db().list.delete({ where: { id: listId } });

  revalidatePath("/lists");
  redirect("/lists");
}

export async function leaveList(listId: string) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const membership = await getMembership(listId, session.user.id);
  if (!membership) {
    return { error: "You're not a member of this list." };
  }
  if (membership.role === "OWNER") {
    return { error: "Owners can't leave — delete the list instead." };
  }

  await db().listMember.delete({
    where: { listId_userId: { listId, userId: session.user.id } },
  });

  revalidatePath("/lists");
  redirect("/lists");
}
