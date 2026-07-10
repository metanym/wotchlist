"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { updateNotifyOnItemAdded } from "./actions";

export function NotificationSettings({
  notifyOnItemAdded,
}: {
  notifyOnItemAdded: boolean;
}) {
  const [enabled, setEnabled] = useState(notifyOnItemAdded);
  const [isPending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const result = await updateNotifyOnItemAdded(next);
      if (result?.error) {
        toast.error(result.error);
        setEnabled(!next);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">Notifications</h2>
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
        <Label htmlFor="notifyOnItemAdded" className="cursor-pointer">
          Notify me when items are added to shared lists
        </Label>
        <Toggle
          id="notifyOnItemAdded"
          pressed={enabled}
          onPressedChange={onChange}
          disabled={isPending}
        >
          {enabled ? "On" : "Off"}
        </Toggle>
      </div>
    </div>
  );
}
