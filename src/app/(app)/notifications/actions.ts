"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getNotifications() {
  const session = await auth();
  if (!session) return [];

  return db().notification.findMany({
    where: { userId: session.user.id },
    include: {
      actor: true,
      list: true,
      listItem: { include: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUpcomingReminders() {
  const session = await auth();
  if (!session) return [];

  return db().reminder.findMany({
    where: { userId: session.user.id, firedAt: null },
    include: { listItem: { include: { title: true, list: true } } },
    orderBy: { remindAt: "asc" },
  });
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session) return 0;

  return db().notification.count({
    where: { userId: session.user.id, read: false },
  });
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  await db().notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  await db().notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  const notification = await db().notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== session.user.id) {
    return { error: "Notification not found." };
  }

  if (notification.type === "REMINDER" && notification.listItemId) {
    await db().reminder.deleteMany({
      where: { listItemId: notification.listItemId, userId: session.user.id },
    });
  }

  await db().notification.delete({ where: { id } });

  revalidatePath(`/lists/${notification.listId}`);
  return { success: true };
}
