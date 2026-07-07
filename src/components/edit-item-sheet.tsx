"use client";

import { useState, useTransition } from "react";
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
import { updateItemDetails } from "@/app/(app)/lists/[id]/item-actions";
import type { ListItem, Title } from "@prisma/client";

type ItemWithTitle = ListItem & { title: Title };

export function EditItemSheet({
  item,
  open,
  onOpenChange,
}: {
  item: ItemWithTitle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [allEpisodesAvail, setAllEpisodesAvail] = useState(false);

  if (!item) return null;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateItemDetails(item!.listId, item!.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Saved");
        onOpenChange(false);
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) setAllEpisodesAvail(item.allEpisodesAvail ?? false);
        onOpenChange(next);
      }}
    >
      <SheetContent className="flex flex-col gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit details</SheetTitle>
        </SheetHeader>

        <div className="flex gap-3 px-4">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {item.title.posterUrl && (
              <Image
                src={item.title.posterUrl}
                alt={item.title.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-medium leading-tight">{item.title.title}</p>
            <p className="text-sm text-muted-foreground">{item.title.year}</p>
          </div>
        </div>

        <form action={onSubmit} className="flex flex-1 flex-col gap-4 px-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="streamingService">Streaming service</Label>
            <Select name="streamingService" defaultValue={item.streamingService ?? undefined}>
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

          {item.title.type === "SERIES" && (
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
                  defaultValue={item.currentSeason ?? undefined}
                  className="h-11"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="recommendedBy">Recommended by</Label>
            <Input
              id="recommendedBy"
              name="recommendedBy"
              defaultValue={item.recommendedBy ?? undefined}
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue={item.priority ? String(item.priority) : undefined}>
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
            <Textarea id="notes" name="notes" defaultValue={item.notes ?? undefined} />
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" className="h-11" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
