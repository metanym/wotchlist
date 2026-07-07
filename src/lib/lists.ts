import { db } from "@/lib/db";
import type { MemberRole } from "@prisma/client";

export async function getUserLists(userId: string) {
  const memberships = await db().listMember.findMany({
    where: { userId },
    include: {
      list: {
        include: {
          _count: { select: { items: { where: { archivedAt: null } } } },
        },
      },
    },
    orderBy: { list: { updatedAt: "desc" } },
  });

  return memberships.map((m) => ({
    ...m.list,
    role: m.role,
    itemCount: m.list._count.items,
  }));
}

export async function getMembership(listId: string, userId: string) {
  return db().listMember.findUnique({
    where: { listId_userId: { listId, userId } },
  });
}

export function canEdit(role: MemberRole | undefined) {
  return role === "OWNER" || role === "EDITOR";
}

export function canManageMembers(role: MemberRole | undefined) {
  return role === "OWNER";
}
