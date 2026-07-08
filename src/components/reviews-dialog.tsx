"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertReview, deleteReview } from "@/app/(app)/lists/[id]/review-actions";
import type { Review, User } from "@prisma/client";

type ReviewWithUser = Review & { user: User };

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              "size-6",
              n <= value ? "fill-current text-foreground" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function reviewerName(user: User) {
  return user.displayName ?? user.email;
}

export function ReviewsDialog({
  listId,
  itemId,
  itemTitle,
  reviews,
  currentUserId,
  open,
  onOpenChange,
}: {
  listId: string;
  itemId: string;
  itemTitle: string;
  reviews: ReviewWithUser[];
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const myReview = reviews.find((r) => r.userId === currentUserId);
  const others = reviews.filter((r) => r.userId !== currentUserId);

  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(myReview?.rating ?? 0);
      setComment(myReview?.comment ?? "");
    }
  }, [open, myReview?.rating, myReview?.comment]);

  function onSubmit() {
    if (!rating) {
      toast.error("Pick a star rating.");
      return;
    }
    const formData = new FormData();
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    startTransition(async () => {
      const result = await upsertReview(listId, itemId, formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Review saved");
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteReview(listId, itemId);
      if (result?.error) toast.error(result.error);
      setRating(0);
      setComment("");
      setDeleteOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reviews · {itemTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-md border border-border p-3">
          <p className="text-sm font-medium">Your review</p>
          <StarPicker value={rating} onChange={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think?"
          />
          <div className="flex gap-2">
            <Button className="h-10 flex-1" disabled={isPending} onClick={onSubmit}>
              {myReview ? "Update review" : "Post review"}
            </Button>
            {myReview && (
              <Button
                variant="outline"
                className="h-10"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <div className="flex flex-col gap-3">
            {others.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {reviewerName(review.user).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{reviewerName(review.user)}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "size-3",
                            n <= review.rating
                              ? "fill-current text-foreground"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {review.comment && <p className="text-sm">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
        )}
      </DialogContent>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete review"
        description="This removes your rating and comment for this title."
        confirmLabel="Delete"
        onConfirm={onDelete}
      />
    </Dialog>
  );
}
