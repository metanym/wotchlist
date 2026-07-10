"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Enter a display name." };

  await db().user.update({
    where: { id: session.user.id },
    data: { displayName },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateNotifyOnItemAdded(notifyOnItemAdded: boolean) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  await db().user.update({
    where: { id: session.user.id },
    data: { notifyOnItemAdded },
  });

  revalidatePath("/settings");
  return { success: true };
}
