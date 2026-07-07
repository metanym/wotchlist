"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListItemCard } from "@/components/list-item-card";
import { STREAMING_SERVICES, WATCH_STATUS_LABELS } from "@/lib/constants";
import { LayoutGrid, List as ListIcon, ListVideo } from "lucide-react";
import type { ListItem, Title } from "@prisma/client";

type ItemWithTitle = ListItem & { title: Title };

type SortKey = "dateAdded" | "title" | "rating" | "priority";

export function ListDetailView({
  items,
  canEdit,
}: {
  items: ItemWithTitle[];
  canEdit: boolean;
}) {
  const [tab, setTab] = useState<"active" | "archive">("active");
  const [compact, setCompact] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("dateAdded");

  const activeItems = items.filter((i) => !i.archivedAt);
  const archivedItems = items.filter((i) => i.archivedAt);
  const base = tab === "active" ? activeItems : archivedItems;

  const filtered = useMemo(() => {
    let result = base;
    if (statusFilter !== "all") result = result.filter((i) => i.watchStatus === statusFilter);
    if (serviceFilter !== "all") result = result.filter((i) => i.streamingService === serviceFilter);
    if (priorityFilter !== "all")
      result = result.filter((i) => String(i.priority ?? "") === priorityFilter);
    if (typeFilter !== "all") result = result.filter((i) => i.title.type === typeFilter);

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.title.localeCompare(b.title.title);
        case "rating":
          return Number(b.title.imdbRating ?? 0) - Number(a.title.imdbRating ?? 0);
        case "priority":
          return (a.priority ?? 99) - (b.priority ?? 99);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    return result;
  }, [base, statusFilter, serviceFilter, priorityFilter, typeFilter, sort]);

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archive")}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="active">Active ({activeItems.length})</TabsTrigger>
            <TabsTrigger value="archive">Archive ({archivedItems.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-1">
            <Toggle pressed={!compact} onPressedChange={() => setCompact(false)} className="size-9">
              <LayoutGrid className="size-4" />
            </Toggle>
            <Toggle pressed={compact} onPressedChange={() => setCompact(true)} className="size-9">
              <ListIcon className="size-4" />
            </Toggle>
          </div>
        </div>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-auto text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(WATCH_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="h-9 w-auto text-xs">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {STREAMING_SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-auto text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="1">High</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-auto text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Movies & series</SelectItem>
            <SelectItem value="MOVIE">Movies</SelectItem>
            <SelectItem value="SERIES">Series</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-auto text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded">Date added</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="rating">IMDb rating</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <ListVideo className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {tab === "archive" ? "Nothing archived yet" : "Nothing here yet"}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {tab === "archive"
              ? "Titles you mark watched or dropped land here."
              : "Add something to watch from Search."}
          </p>
        </div>
      ) : compact ? (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <ListItemCard key={item.id} item={item} canEdit={canEdit} compact />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => (
            <ListItemCard key={item.id} item={item} canEdit={canEdit} compact={false} />
          ))}
        </div>
      )}
    </div>
  );
}
