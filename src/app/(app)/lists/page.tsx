import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserLists } from "@/lib/lists";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/list-card";
import { ListVideo, Plus } from "lucide-react";

export default async function ListsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const lists = await getUserLists(session.user.id);
  const personal = lists.filter((l) => l.type === "PERSONAL");
  const shared = lists.filter((l) => l.type === "SHARED");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Your lists</h1>
        <Button asChild size="sm" className="h-9">
          <Link href="/lists/new">
            <Plus className="size-4" />
            New list
          </Link>
        </Button>
      </div>

      {lists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {personal.length > 0 && (
            <ListSection title="Personal" lists={personal} />
          )}
          {shared.length > 0 && <ListSection title="Shared" lists={shared} />}
        </div>
      )}
    </div>
  );
}

function ListSection({
  title,
  lists,
}: {
  title: string;
  lists: Awaited<ReturnType<typeof getUserLists>>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <ListVideo className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">Nothing here yet</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Create a list to start tracking what to watch.
      </p>
      <Button asChild size="sm" className="mt-2 h-9">
        <Link href="/lists/new">
          <Plus className="size-4" />
          Create your first list
        </Link>
      </Button>
    </div>
  );
}
