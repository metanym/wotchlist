"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getMembership } from "@/lib/lists";

export async function setReminder(listId: string, itemId: string, formData: FormData) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  const membership = await getMembership(listId, session.user.id);
  if (!membership) return { error: "You don't have access to this list." };

  const remindAtRaw = String(formData.get("remindAt") ?? "");
  const remindAt = remindAtRaw ? new Date(remindAtRaw) : null;
  if (!remindAt || Number.isNaN(remindAt.getTime())) {
    return { error: "Pick a date and time." };
  }
  if (remindAt.getTime() <= Date.now()) {
    return { error: "Pick a time in the future." };
  }

  const note = String(formData.get("note") ?? "").trim() || null;

  await db().reminder.upsert({
    where: { listItemId_userId: { listItemId: itemId, userId: session.user.id } },
    create: { listItemId: itemId, userId: session.user.id, remindAt, note },
    update: { remindAt, note, firedAt: null },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function cancelReminder(listId: string, itemId: string) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  await db().reminder.deleteMany({
    where: { listItemId: itemId, userId: session.user.id },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}
