"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STREAMING_SERVICES } from "@/lib/constants";
import type { OmdbSearchResult } from "@/lib/omdb";
import { addToListAction, getEditableLists } from "@/app/(app)/search/actions";
import { Plus } from "lucide-react";

const NEW_LIST_VALUE = "__new__";

interface EditableList {
  id: string;
  name: string;
}

export function AddToListSheet({
  title,
  open,
  onOpenChange,
}: {
  title: OmdbSearchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [lists, setLists] = useState<EditableList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [allEpisodesAvail, setAllEpisodesAvail] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getEditableLists().then((result) => {
        setLists(result);
        setSelectedListId(result[0]?.id ?? NEW_LIST_VALUE);
      });
      setAllEpisodesAvail(title?.allEpisodesAvailable ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title?.imdbId]);

  if (!title) return null;

  const defaultStreamingService = STREAMING_SERVICES.find((s) =>
    title.streamingServices.includes(s)
  );
  const isCreatingList = selectedListId === NEW_LIST_VALUE;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addToListAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Added "${title!.title}" to your list`);
        onOpenChange(false);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add to list</SheetTitle>
        </SheetHeader>

        <div className="flex gap-3 px-4">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {title.posterUrl && (
              <Image
                src={title.posterUrl}
                alt={title.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-medium leading-tight">{title.title}</p>
            <p className="text-sm text-muted-foreground">
              {title.year} · {title.type === "SERIES" ? "Series" : "Movie"}
            </p>
          </div>
        </div>

        <form action={onSubmit} className="flex flex-1 flex-col gap-4 px-4 pt-4">
          <input type="hidden" name="imdbId" value={title.imdbId} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="listId">List</Label>
            <Select name="listId" value={selectedListId} onValueChange={setSelectedListId} required>
              <SelectTrigger id="listId" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_LIST_VALUE}>
                  <Plus className="size-3.5" />
                  Create new list
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCreatingList && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="newListName">New list name</Label>
              <Input
                id="newListName"
                name="newListName"
                placeholder="Rainy Day Films"
                required
                className="h-11"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="streamingService">Streaming service</Label>
            <Select name="streamingService" defaultValue={defaultStreamingService}>
              <SelectTrigger id="streamingService" className="h-11 w-full">
                <SelectValue placeholder="Where's it available?" />
              </SelectTrigger>
              <SelectContent>
                {STREAMING_SERVICES.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {title.type === "SERIES" && (
            <>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="allEpisodesAvail" className="cursor-pointer">
                  All episodes available?
                </Label>
                <Toggle
                  id="allEpisodesAvail"
                  pressed={allEpisodesAvail}
                  onPressedChange={setAllEpisodesAvail}
                >
                  {allEpisodesAvail ? "Yes" : "No"}
                </Toggle>
                <input type="hidden" name="allEpisodesAvail" value={String(allEpisodesAvail)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentSeason">Current season watching</Label>
                <Input
                  id="currentSeason"
                  name="currentSeason"
                  type="number"
                  min={1}
                  className="h-11"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="recommendedBy">Recommended by</Label>
            <Input id="recommendedBy" name="recommendedBy" placeholder="Jon" className="h-11" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority">
              <SelectTrigger id="priority" className="h-11 w-full">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Anything worth remembering" />
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" className="h-11" disabled={isPending}>
              {isPending ? "Adding…" : "Add to list"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
