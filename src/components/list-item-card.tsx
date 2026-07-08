"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EditItemSheet } from "@/components/edit-item-sheet";
import { TitleInfoDialog } from "@/components/title-info-dialog";
import { ReviewsDialog } from "@/components/reviews-dialog";
import {
  STREAMING_SERVICE_COLORS,
  PRIORITY_LABELS,
  WATCH_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { setWatchStatus, toggleArchived, deleteItem } from "@/app/(app)/lists/[id]/item-actions";
import type { ListItem, Review, Title, User, WatchStatus } from "@prisma/client";
import {
  Film,
  MoreVertical,
  Star,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
  Info,
  CheckCircle2,
  Clock,
  PlayCircle,
  MessageSquare,
} from "lucide-react";

type ItemWithTitle = ListItem & { title: Title; reviews: (Review & { user: User })[] };

const STATUS_DOT: Record<WatchStatus, string> = {
  UNWATCHED: "bg-zinc-500",
  WATCHING: "bg-blue-500",
  WATCHED: "bg-emerald-500",
  DROPPED: "bg-red-500",
};

function averageRating(reviews: Review[]) {
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function ListItemCard({
  item,
  canEdit,
  compact,
  currentUserId,
}: {
  item: ItemWithTitle;
  canEdit: boolean;
  compact: boolean;
  currentUserId: string;
}) {
  const [, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const avgRating = averageRating(item.reviews);

  function onStatusChange(status: WatchStatus) {
    startTransition(async () => {
      const result = await setWatchStatus(item.listId, item.id, status);
      if (result?.error) toast.error(result.error);
    });
  }

  function onToggleArchive() {
    startTransition(async () => {
      const result = await toggleArchived(item.listId, item.id, !item.archivedAt);
      if (result?.error) toast.error(result.error);
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteItem(item.listId, item.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setDeleteOpen(false);
      }
    });
  }

  const dialogs = (
    <>
      <EditItemSheet item={item} open={editOpen} onOpenChange={setEditOpen} />
      <TitleInfoDialog info={item.title} open={infoOpen} onOpenChange={setInfoOpen} />
      <ReviewsDialog
        listId={item.listId}
        itemId={item.id}
        itemTitle={item.title.title}
        reviews={item.reviews}
        currentUserId={currentUserId}
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove title"
        description={`Remove "${item.title.title}" from this list? This can't be undone.`}
        confirmLabel="Remove"
        onConfirm={onDelete}
      />
    </>
  );

  const reviewsTrigger = (
    <button
      type="button"
      onClick={() => setReviewsOpen(true)}
      className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground"
    >
      <MessageSquare className="size-4" />
      {avgRating ? `${avgRating.toFixed(1)} (${item.reviews.length})` : "Review"}
    </button>
  );

  if (compact) {
    return (
      <Card className="flex-row items-center gap-3 p-3">
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
          {item.title.posterUrl ? (
            <Image src={item.title.posterUrl} alt={item.title.title} fill sizes="44px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Film className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", STATUS_DOT[item.watchStatus])} />
            <p className="truncate text-sm font-medium">{item.title.title}</p>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {item.title.year} · {item.streamingService ?? "No service set"}
            {item.currentSeason ? ` · S${item.currentSeason}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setInfoOpen(true)} className="text-muted-foreground">
              <Info className="size-3.5" />
            </button>
            {reviewsTrigger}
          </div>
        </div>
        <ItemMenu
          item={item}
          canEdit={canEdit}
          onStatusChange={onStatusChange}
          onToggleArchive={onToggleArchive}
          onEdit={() => setEditOpen(true)}
          onDeleteRequest={() => setDeleteOpen(true)}
        />
        {dialogs}
      </Card>
    );
  }

  return (
    <Card className="gap-3 overflow-hidden py-0 pb-3">
      <div className="relative aspect-2/3 w-full bg-muted">
        {item.title.posterUrl ? (
          <Image
            src={item.title.posterUrl}
            alt={item.title.title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="size-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label="View synopsis"
            className="flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur"
          >
            <Info className="size-4" />
          </button>
          <ItemMenu
            item={item}
            canEdit={canEdit}
            onStatusChange={onStatusChange}
            onToggleArchive={onToggleArchive}
            onEdit={() => setEditOpen(true)}
            onDeleteRequest={() => setDeleteOpen(true)}
          />
        </div>
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 backdrop-blur">
          <span className={cn("size-2 rounded-full", STATUS_DOT[item.watchStatus])} />
          <span className="text-[10px] font-medium">{WATCH_STATUS_LABELS[item.watchStatus]}</span>
        </div>
        {item.title.type === "SERIES" && item.allEpisodesAvail !== null && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-background/80 px-1.5 py-0.5 backdrop-blur">
            {item.allEpisodesAvail ? (
              <CheckCircle2 className="size-3 text-emerald-500" />
            ) : (
              <Clock className="size-3 text-amber-500" />
            )}
            <span className="text-[9px] font-medium">
              {item.allEpisodesAvail ? "All available" : "Still airing"}
            </span>
          </div>
        )}
        {item.currentSeason && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-background/80 px-1.5 py-0.5 backdrop-blur">
            <PlayCircle className="size-3 text-foreground" />
            <span className="text-[9px] font-medium">Season {item.currentSeason}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-3">
        <p className="truncate text-sm font-medium leading-tight">{item.title.title}</p>
        <p className="text-xs text-muted-foreground">{item.title.year}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {item.title.imdbRating && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Star className="size-2.5 fill-current" />
              {item.title.imdbRating}
            </Badge>
          )}
          {item.title.rtScore && (
            <Badge variant="outline" className="text-[10px]">
              🍅 {item.title.rtScore}
            </Badge>
          )}
          {item.priority && (
            <Badge variant="outline" className="text-[10px]">
              {PRIORITY_LABELS[item.priority]}
            </Badge>
          )}
          {item.title.type === "SERIES" && item.title.totalSeasons && (
            <Badge variant="outline" className="text-[10px]">
              {item.title.totalSeasons}
              {item.title.totalSeasons === "1" ? " Season" : " Seasons"}
              {item.title.totalEpisodes ? ` · ${item.title.totalEpisodes} Ep` : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {item.streamingService ? (
            <Badge
              className={cn(
                "w-fit border text-[10px]",
                STREAMING_SERVICE_COLORS[item.streamingService] ?? ""
              )}
            >
              {item.streamingService}
            </Badge>
          ) : (
            <span />
          )}
          {reviewsTrigger}
        </div>

        {item.recommendedBy && (
          <p className="truncate text-xs text-muted-foreground">Rec by {item.recommendedBy}</p>
        )}
      </div>

      {dialogs}
    </Card>
  );
}

function ItemMenu({
  item,
  canEdit,
  onStatusChange,
  onToggleArchive,
  onEdit,
  onDeleteRequest,
}: {
  item: ItemWithTitle;
  canEdit: boolean;
  onStatusChange: (status: WatchStatus) => void;
  onToggleArchive: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  if (!canEdit) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="size-9 rounded-full bg-background/80 backdrop-blur"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["UNWATCHED", "WATCHING", "WATCHED", "DROPPED"] as WatchStatus[])
          .filter((s) => s !== item.watchStatus)
          .map((status) => (
            <DropdownMenuItem key={status} onClick={() => onStatusChange(status)}>
              Mark as {WATCH_STATUS_LABELS[status]}
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleArchive}>
          {item.archivedAt ? (
            <>
              <ArchiveRestore className="size-4" />
              Restore
            </>
          ) : (
            <>
              <Archive className="size-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDeleteRequest}>
          <Trash2 className="size-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
