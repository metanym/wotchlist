"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { searchTitles, upsertTitle } from "@/lib/omdb";
import { getMembership } from "@/lib/lists";

export async function searchAction(query: string) {
  if (!query.trim()) return { results: [] as Awaited<ReturnType<typeof searchTitles>>, error: null as string | null };
  try {
    return { results: await searchTitles(query.trim()), error: null };
  } catch {
    return { results: [], error: "Search is unavailable right now." };
  }
}

export async function getEditableLists() {
  const session = await auth();
  if (!session) return [];

  const memberships = await db().listMember.findMany({
    where: { userId: session.user.id, role: { in: ["OWNER", "EDITOR"] } },
    include: { list: true },
    orderBy: { list: { name: "asc" } },
  });

  return memberships.map((m) => m.list);
}

export async function addToListAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "You need to sign in." };

  let listId = String(formData.get("listId") ?? "");
  const imdbId = String(formData.get("imdbId") ?? "");

  if (listId === "__new__") {
    const newListName = String(formData.get("newListName") ?? "").trim();
    if (!newListName) return { error: "Give your new list a name." };

    const list = await db().list.create({
      data: {
        name: newListName,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
    });
    listId = list.id;
    revalidatePath("/lists");
    revalidatePath("/dashboard");
  }

  const membership = await getMembership(listId, session.user.id);
  if (!membership || membership.role === "VIEWER") {
    return { error: "You don't have permission to add to this list." };
  }

  let title;
  try {
    title = await upsertTitle(imdbId);
  } catch {
    return { error: "Couldn't fetch details for that title." };
  }

  const streamingService = String(formData.get("streamingService") ?? "") || null;
  const recommendedBy = String(formData.get("recommendedBy") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const priorityRaw = String(formData.get("priority") ?? "");
  const priority = priorityRaw ? Number(priorityRaw) : null;
  const allEpisodesAvail =
    title.type === "SERIES" ? formData.get("allEpisodesAvail") === "true" : null;
  const currentSeasonRaw = String(formData.get("currentSeason") ?? "");
  const currentSeason =
    title.type === "SERIES" && currentSeasonRaw ? Number(currentSeasonRaw) : null;

  try {
    await db().listItem.create({
      data: {
        listId,
        titleId: title.id,
        addedById: session.user.id,
        streamingService,
        recommendedBy,
        notes,
        priority,
        allEpisodesAvail,
        currentSeason,
      },
    });
  } catch {
    return { error: "That title is already on this list." };
  }

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}
