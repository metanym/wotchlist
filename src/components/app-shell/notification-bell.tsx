"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(app)/notifications/actions";

type NotificationList = Awaited<ReturnType<typeof getNotifications>>;

function actorName(actor: NotificationList[number]["actor"]) {
  if (!actor) return "Someone";
  return actor.displayName ?? actor.email;
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getNotifications().then(setNotifications);
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
                  <p className="text-sm">
                    <span className="font-medium">{actorName(n.actor)}</span> added{" "}
                    <span className="font-medium">
                      {n.listItem?.title.title ?? "a title"}
                    </span>{" "}
                    to <span className="font-medium">{n.list.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
