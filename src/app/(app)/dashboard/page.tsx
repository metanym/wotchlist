import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserLists } from "@/lib/lists";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListCard } from "@/components/list-card";
import { Film, ListVideo, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const lists = await getUserLists(session.user.id);
  const listIds = lists.map((l) => l.id);

  const recentItems = listIds.length
    ? await db().listItem.findMany({
        where: { listId: { in: listIds }, archivedAt: null },
        include: { title: true, list: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Hey {session.user.displayName}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s going on.</p>
      </div>

      <Button asChild size="lg" className="h-11">
        <Link href="/search">
          <Plus className="size-4" />
          Add something to watch
        </Link>
      </Button>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Your lists</h2>
        {lists.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
            <ListVideo className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Create a list to start tracking what to watch.
            </p>
            <Button asChild size="sm" className="mt-2 h-9">
              <Link href="/lists/new">Create a list</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lists.slice(0, 4).map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
            {lists.length > 4 && (
              <Button asChild variant="ghost" className="h-9">
                <Link href="/lists">View all lists</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {recentItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recently added</h2>
          <div className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/lists/${item.listId}`}>
                <Card className="flex-row items-center gap-3 p-3">
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                    {item.title.posterUrl ? (
                      <Image
                        src={item.title.posterUrl}
                        alt={item.title.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium">{item.title.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Added to {item.list.name}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
