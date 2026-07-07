"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserX } from "lucide-react";
import type { List, ListMember, MemberRole, User } from "@prisma/client";
import {
  inviteMember,
  updateMemberRole,
  removeMember,
  renameListSettings,
  deleteListSettings,
} from "./actions";

type ListWithMembers = List & { members: (ListMember & { user: User })[] };

export function SettingsView({
  list,
  currentUserId,
}: {
  list: ListWithMembers;
  currentUserId: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold tracking-tight">List settings</h1>
      <DetailsForm list={list} />
      <Separator />
      <MembersSection list={list} currentUserId={currentUserId} />
      <Separator />
      <DangerZone listId={list.id} />
    </div>
  );
}

function DetailsForm({ list }: { list: List }) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await renameListSettings(list.id, formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Saved");
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={list.name} required className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={list.description ?? ""} />
      </div>
      <Button type="submit" className="h-11 w-fit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function MembersSection({
  list,
  currentUserId,
}: {
  list: ListWithMembers;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  function onInvite(formData: FormData) {
    startTransition(async () => {
      const result = await inviteMember(list.id, formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Invite sent");
    });
  }

  function onRoleChange(memberId: string, role: MemberRole) {
    startTransition(async () => {
      const result = await updateMemberRole(list.id, memberId, role);
      if (result?.error) toast.error(result.error);
    });
  }

  function onRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(list.id, memberId);
      if (result?.error) toast.error(result.error);
      setRemoveTarget(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Sharing</h2>
        {list.type === "PERSONAL" && (
          <p className="mt-1 text-xs text-muted-foreground">
            This list is private. Invite someone below to make it a shared list.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {list.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 rounded-md border border-border p-3">
            <Avatar className="size-9">
              <AvatarFallback>
                {(member.user.displayName ?? member.user.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-sm font-medium">
                {member.user.displayName ?? member.user.email}
                {member.userId === currentUserId && (
                  <span className="text-muted-foreground"> (you)</span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
            </div>
            {member.role === "OWNER" ? (
              <Badge variant="secondary">Owner</Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(v) => onRoleChange(member.id, v as MemberRole)}
                >
                  <SelectTrigger className="h-9 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={() => setRemoveTarget(member.id)}
                >
                  <UserX className="size-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form action={onInvite} className="flex flex-col gap-3 rounded-md border border-border p-3">
        <Label htmlFor="invite-email" className="text-sm">
          Invite by email
        </Label>
        <div className="flex gap-2">
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="friend@example.com"
            required
            className="h-11 flex-1"
          />
          <Select name="role" defaultValue="EDITOR">
            <SelectTrigger className="h-11 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? "Sending…" : "Send invite"}
        </Button>
      </form>

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove member"
        description="They'll lose access to this list immediately."
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeTarget) onRemove(removeTarget);
        }}
      />
    </div>
  );
}

function DangerZone({ listId }: { listId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const result = await deleteListSettings(listId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-destructive">Danger zone</h2>
      <Button
        variant="outline"
        className="h-11 w-fit border-destructive text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        Delete list
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete list"
        description="This permanently deletes the list and everything on it. This can't be undone."
        confirmLabel="Delete"
        onConfirm={onDelete}
      />
    </div>
  );
}
