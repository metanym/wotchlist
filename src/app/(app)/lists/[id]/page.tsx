import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canEdit } from "@/lib/lists";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Users } from "lucide-react";
import { ListDetailView } from "./list-detail-view";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const membership = await db().listMember.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });
  if (!membership) notFound();

  const list = await db().list.findUnique({
    where: { id },
    include: {
      items: { include: { title: true } },
    },
  });
  if (!list) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{list.name}</h1>
            {list.type === "SHARED" && (
              <Badge variant="secondary" className="gap-1">
                <Users className="size-3" />
                Shared
              </Badge>
            )}
          </div>
          {list.description && (
            <p className="text-sm text-muted-foreground">{list.description}</p>
          )}
        </div>
        {membership.role === "OWNER" && (
          <Button asChild variant="outline" size="icon" className="size-9 shrink-0">
            <Link href={`/lists/${id}/settings`}>
              <Settings className="size-4" />
            </Link>
          </Button>
        )}
      </div>

      <ListDetailView items={list.items} canEdit={canEdit(membership.role)} />
    </div>
  );
}
