"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, Clock, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getNotifications,
  getUpcomingReminders,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from "@/app/(app)/notifications/actions";
import { cancelReminder } from "@/app/(app)/lists/[id]/reminder-actions";

type NotificationList = Awaited<ReturnType<typeof getNotifications>>;
type UpcomingReminderList = Awaited<ReturnType<typeof getUpcomingReminders>>;

function actorName(actor: NotificationList[number]["actor"]) {
  if (!actor) return "Someone";
  return actor.displayName ?? actor.email;
}

function NotificationText({ n }: { n: NotificationList[number] }) {
  const titleName = n.listItem?.title.title ?? "a title";

  if (n.type === "REMINDER") {
    return (
      <>
        <p className="text-sm">
          Reminder: <span className="font-medium">{titleName}</span> in{" "}
          <span className="font-medium">{n.list.name}</span>
        </p>
        {n.message && <p className="text-sm text-muted-foreground">&ldquo;{n.message}&rdquo;</p>}
      </>
    );
  }

  return (
    <p className="text-sm">
      <span className="font-medium">{actorName(n.actor)}</span> added{" "}
      <span className="font-medium">{titleName}</span> to{" "}
      <span className="font-medium">{n.list.name}</span>
    </p>
  );
}

function formatReminderDate(date: Date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ initialUnreadCount }: { initialUnreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationList>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingReminderList>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getNotifications().then(setNotifications);
      getUpcomingReminders().then(setUpcomingReminders);
    }
  }, [open]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && unreadCount > 0) {
      startTransition(async () => {
        await markAllNotificationsRead();
        setUnreadCount(0);
      });
    }
  }

  function onItemClick(id: string, read: boolean) {
    if (!read) {
      markNotificationRead(id);
    }
  }

  function onDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result?.error) toast.error(result.error);
    });
  }

  function onCancelReminder(e: React.MouseEvent, reminder: UpcomingReminderList[number]) {
    e.preventDefault();
    e.stopPropagation();
    setUpcomingReminders((prev) => prev.filter((r) => r.id !== reminder.id));
    startTransition(async () => {
      const result = await cancelReminder(reminder.listItem.listId, reminder.listItemId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <button
        onClick={() => onOpenChange(true)}
        aria-label="Notifications"
        className="relative flex size-9 items-center justify-center rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col px-4 pb-4">
          {upcomingReminders.length > 0 && (
            <div className="mb-2 flex flex-col border-b border-border pb-2">
              <p className="pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Upcoming reminders
              </p>
              {upcomingReminders.map((r) => (
                <Link
                  key={r.id}
                  href={`/lists/${r.listItem.listId}`}
                  className="flex items-start gap-2 py-2"
                >
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{r.listItem.title.title}</span> in{" "}
                      <span className="font-medium">{r.listItem.list.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatReminderDate(r.remindAt)}</p>
                    {r.note && (
                      <p className="text-sm text-muted-foreground">&ldquo;{r.note}&rdquo;</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onCancelReminder(e, r)}
                    aria-label="Cancel reminder"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </Link>
              ))}
            </div>
          )}

          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {isPending ? "Loading…" : "Nothing yet."}
            </p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={`/lists/${n.listId}`}
                onClick={() => onItemClick(n.id, n.read)}
                className="flex items-start gap-2 border-b border-border py-3 last:border-0"
              >
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />}
                <div className={n.read ? "flex-1 pl-4" : "flex-1"}>
                  <NotificationText n={n} />
                  <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => onDelete(e, n.id)}
                  aria-label="Delete notification"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
