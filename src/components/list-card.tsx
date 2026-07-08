import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListVideo, Users } from "lucide-react";
import type { getUserLists } from "@/lib/lists";

type ListSummary = Awaited<ReturnType<typeof getUserLists>>[number];

export function ListCard({ list }: { list: ListSummary }) {
  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="flex-row items-center gap-3 p-3 transition-colors hover:border-foreground/20">
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
          {list.coverImageUrl ? (
            <Image
              src={list.coverImageUrl}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ListVideo className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{list.name}</p>
            {list.type === "SHARED" && (
              <Badge variant="secondary" className="h-4 gap-1 px-1 text-[10px]">
                <Users className="size-2.5" />
                Shared
              </Badge>
            )}
          </div>
          {list.description && (
            <p className="truncate text-xs text-muted-foreground">{list.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {list.itemCount} {list.itemCount === 1 ? "title" : "titles"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
