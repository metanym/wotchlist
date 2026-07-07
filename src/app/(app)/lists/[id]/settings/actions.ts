"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendListInviteEmail } from "@/lib/invite";
import type { MemberRole } from "@prisma/client";

async function assertOwner(listId: string) {
  const session = await auth();
  if (!session) return { session: null, error: "You need to sign in." } as const;

  const membership = await db().listMember.findUnique({
    where: { listId_userId: { listId, userId: session.user.id } },
  });
  if (membership?.role !== "OWNER") {
    return { session, error: "Only the list owner can do that." } as const;
  }
  return { session, error: null } as const;
}

export async function inviteMember(listId: string, formData: FormData) {
  const { session, error } = await assertOwner(listId);
  if (error) return { error };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "VIEWER") as MemberRole;
  if (!email) return { error: "Enter an email address." };

  const list = await db().list.findUnique({ where: { id: listId } });
  if (!list) return { error: "List not found." };

  const invitee = await db().user.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  if (invitee.id === session!.user.id) {
    return { error: "You're already the owner of this list." };
  }

  const existing = await db().listMember.findUnique({
    where: { listId_userId: { listId, userId: invitee.id } },
  });
  if (existing) {
    return { error: "That person is already on this list." };
  }

  await db().listMember.create({
    data: { listId, userId: invitee.id, role },
  });

  try {
    await sendListInviteEmail({
      email,
      listId,
      listName: list.name,
      inviterName: session!.user.displayName ?? session!.user.email ?? "A friend",
    });
  } catch {
    return { error: "Added them to the list, but the invite email failed to send." };
  }

  revalidatePath(`/lists/${listId}/settings`);
  return { success: true };
}

export async function updateMemberRole(listId: string, memberId: string, role: MemberRole) {
  const { error } = await assertOwner(listId);
  if (error) return { error };

  const member = await db().listMember.findUnique({ where: { id: memberId } });
  if (!member || member.listId !== listId) return { error: "Member not found." };
  if (member.role === "OWNER") return { error: "Can't change the owner's role." };

  await db().listMember.update({ where: { id: memberId }, data: { role } });

  revalidatePath(`/lists/${listId}/settings`);
  return { success: true };
}

export async function removeMember(listId: string, memberId: string) {
  const { error } = await assertOwner(listId);
  if (error) return { error };

  const member = await db().listMember.findUnique({ where: { id: memberId } });
  if (!member || member.listId !== listId) return { error: "Member not found." };
  if (member.role === "OWNER") return { error: "Can't remove the owner." };

  await db().listMember.delete({ where: { id: memberId } });

  revalidatePath(`/lists/${listId}/settings`);
  return { success: true };
}

export async function renameListSettings(listId: string, formData: FormData) {
  const { error } = await assertOwner(listId);
  if (error) return { error };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) return { error: "Give your list a name." };

  await db().list.update({ where: { id: listId }, data: { name, description } });

  revalidatePath(`/lists/${listId}`);
  revalidatePath(`/lists/${listId}/settings`);
  revalidatePath("/lists");
  return { success: true };
}

export async function deleteListSettings(listId: string) {
  const { error } = await assertOwner(listId);
  if (error) return { error };

  await db().list.delete({ where: { id: listId } });

  revalidatePath("/lists");
  redirect("/lists");
}
