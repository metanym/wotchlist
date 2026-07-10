"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setReminder, cancelReminder } from "@/app/(app)/lists/[id]/reminder-actions";
import type { Reminder } from "@prisma/client";

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function ReminderDialog({
  listId,
  itemId,
  itemTitle,
  existingReminder,
  open,
  onOpenChange,
}: {
  listId: string;
  itemId: string;
  itemTitle: string;
  existingReminder: Reminder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isCancelling, startCancelling] = useTransition();

  const defaultRemindAt = existingReminder
    ? toLocalInputValue(new Date(existingReminder.remindAt))
    : "";

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await setReminder(listId, itemId, formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Reminder set");
        onOpenChange(false);
      }
    });
  }

  function onCancel() {
    startCancelling(async () => {
      const result = await cancelReminder(listId, itemId);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Reminder cancelled");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reminder · {itemTitle}</DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="remindAt">Remind me on</Label>
            <Input
              id="remindAt"
              name="remindAt"
              type="datetime-local"
              required
              defaultValue={defaultRemindAt}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder={`e.g. "Watch this Friday night" or "Check if all episodes are out yet"`}
              defaultValue={existingReminder?.note ?? ""}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1" disabled={isPending}>
              {isPending ? "Saving…" : existingReminder ? "Update reminder" : "Set reminder"}
            </Button>
            {existingReminder && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={isCancelling}
                onClick={onCancel}
              >
                Cancel reminder
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
