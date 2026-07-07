"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canEdit } from "@/lib/lists";
import type { WatchStatus } from "@prisma/client";

async function assertCanEdit(listId: string) {
  const session = await auth();
  if (!session) return { session: null, error: "You need to sign in." } as const;

  const membership = await db().listMember.findUnique({
    where: { listId_userId: { listId, userId: session.user.id } },
  });
  if (!canEdit(membership?.role)) {
    return { session, error: "You don't have permission to edit this list." } as const;
  }
  return { session, error: null } as const;
}

export async function setWatchStatus(
  listId: string,
  itemId: string,
  status: WatchStatus
) {
  const { error } = await assertCanEdit(listId);
  if (error) return { error };

  const archiving = status === "WATCHED" || status === "DROPPED";

  await db().listItem.update({
    where: { id: itemId },
    data: {
      watchStatus: status,
      watchedAt: status === "WATCHED" ? new Date() : null,
      archivedAt: archiving ? new Date() : null,
    },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function toggleArchived(listId: string, itemId: string, archived: boolean) {
  const { error } = await assertCanEdit(listId);
  if (error) return { error };

  await db().listItem.update({
    where: { id: itemId },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function updateItemDetails(listId: string, itemId: string, formData: FormData) {
  const { error } = await assertCanEdit(listId);
  if (error) return { error };

  const streamingService = String(formData.get("streamingService") ?? "") || null;
  const recommendedBy = String(formData.get("recommendedBy") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const priorityRaw = String(formData.get("priority") ?? "");
  const priority = priorityRaw ? Number(priorityRaw) : null;
  const allEpisodesAvail =
    formData.get("allEpisodesAvail") !== null
      ? formData.get("allEpisodesAvail") === "true"
      : undefined;
  const currentSeasonRaw = String(formData.get("currentSeason") ?? "");
  const currentSeason = currentSeasonRaw ? Number(currentSeasonRaw) : null;

  await db().listItem.update({
    where: { id: itemId },
    data: {
      streamingService,
      recommendedBy,
      notes,
      priority,
      ...(allEpisodesAvail !== undefined ? { allEpisodesAvail } : {}),
      currentSeason,
    },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function deleteItem(listId: string, itemId: string) {
  const { error } = await assertCanEdit(listId);
  if (error) return { error };

  await db().listItem.delete({ where: { id: itemId } });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}
