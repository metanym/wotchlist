"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getMembership } from "@/lib/lists";

export async function getReviews(itemId: string) {
  return db().review.findMany({
    where: { listItemId: itemId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertReview(listId: string, itemId: string, formData: FormData) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  const membership = await getMembership(listId, session.user.id);
  if (!membership) return { error: "You don't have access to this list." };

  const rating = Number(formData.get("rating") ?? 0);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Pick a star rating from 1 to 5." };
  }
  const comment = String(formData.get("comment") ?? "").trim() || null;

  await db().review.upsert({
    where: { listItemId_userId: { listItemId: itemId, userId: session.user.id } },
    create: { listItemId: itemId, userId: session.user.id, rating, comment },
    update: { rating, comment },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function deleteReview(listId: string, itemId: string) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  const review = await db().review.findUnique({
    where: { listItemId_userId: { listItemId: itemId, userId: session.user.id } },
  });
  if (!review) return { error: "Review not found." };

  await db().review.delete({ where: { id: review.id } });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}
