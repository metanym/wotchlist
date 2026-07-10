"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ListVideo, Users } from "lucide-react";
import type { getUserLists } from "@/lib/lists";

type ListSummary = Awaited<ReturnType<typeof getUserLists>>[number];

export function ListSwitcher({
  lists,
  currentListId,
  currentListName,
}: {
  lists: ListSummary[];
  currentListId: string;
  currentListName: string;
}) {
  const others = lists.filter((l) => l.id !== currentListId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-left outline-none">
          <h1 className="truncate text-xl font-semibold tracking-tight">{currentListName}</h1>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch list</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {others.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">No other lists yet.</p>
        ) : (
          others.map((list) => (
            <DropdownMenuItem key={list.id} asChild>
              <Link href={`/lists/${list.id}`} className="flex items-center justify-between gap-2">
                <span className="truncate">{list.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  {list.type === "SHARED" && <Users className="size-3" />}
                  {list.itemCount}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/lists" className="flex items-center gap-2">
            <ListVideo className="size-4" />
            All lists
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
