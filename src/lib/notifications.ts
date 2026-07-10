import { db } from "@/lib/db";

export async function notifyItemAdded({
  listId,
  listItemId,
  actorId,
}: {
  listId: string;
  listItemId: string;
  actorId: string;
}) {
  const list = await db().list.findUnique({ where: { id: listId } });
  if (!list || list.type !== "SHARED") return;

  const recipients = await db().listMember.findMany({
    where: {
      listId,
      userId: { not: actorId },
      user: { notifyOnItemAdded: true },
    },
    select: { userId: true },
  });

  if (recipients.length === 0) return;

  await db().notification.createMany({
    data: recipients.map((r) => ({
      userId: r.userId,
      type: "ITEM_ADDED",
      listId,
      listItemId,
      actorId,
    })),
  });
}
