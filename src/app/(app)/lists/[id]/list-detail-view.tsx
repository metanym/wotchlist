"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListItemCard } from "@/components/list-item-card";
import { STREAMING_SERVICES, WATCH_STATUS_LABELS } from "@/lib/constants";
import { LayoutGrid, List as ListIcon, ListVideo, SlidersHorizontal } from "lucide-react";
import type { ListItem, Review, Title, User } from "@prisma/client";

type ItemWithTitle = ListItem & { title: Title; reviews: (Review & { user: User })[] };

type SortKey = "dateAdded" | "title" | "rating" | "priority";

const VIEW_MODE_KEY = "wotchlist:view-mode";

const DEFAULT_FILTERS = {
  status: "all",
  service: "all",
  priority: "all",
  type: "all",
  available: "all",
};

export function ListDetailView({
  items,
  canEdit,
  currentUserId,
}: {
  items: ItemWithTitle[];
  canEdit: boolean;
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"active" | "archive">("active");
  const [compact, setCompact] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_FILTERS.status);
  const [serviceFilter, setServiceFilter] = useState(DEFAULT_FILTERS.service);
  const [priorityFilter, setPriorityFilter] = useState(DEFAULT_FILTERS.priority);
  const [typeFilter, setTypeFilter] = useState(DEFAULT_FILTERS.type);
  const [availableFilter, setAvailableFilter] = useState(DEFAULT_FILTERS.available);
  const [sort, setSort] = useState<SortKey>("dateAdded");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (stored === "compact") setCompact(true);
  }, []);

  function updateCompact(next: boolean) {
    setCompact(next);
    localStorage.setItem(VIEW_MODE_KEY, next ? "compact" : "grid");
  }

  const activeItems = items.filter((i) => !i.archivedAt);
  const archivedItems = items.filter((i) => i.archivedAt);
  const base = tab === "active" ? activeItems : archivedItems;

  const activeFilterCount = [
    statusFilter,
    serviceFilter,
    priorityFilter,
    typeFilter,
    availableFilter,
  ].filter((v) => v !== "all").length;

  const filtered = useMemo(() => {
    let result = base;
    if (statusFilter !== "all") result = result.filter((i) => i.watchStatus === statusFilter);
    if (serviceFilter !== "all") result = result.filter((i) => i.streamingService === serviceFilter);
    if (priorityFilter !== "all")
      result = result.filter((i) => String(i.priority ?? "") === priorityFilter);
    if (typeFilter !== "all") result = result.filter((i) => i.title.type === typeFilter);
    if (availableFilter !== "all")
      result = result.filter((i) => String(i.allEpisodesAvail ?? "") === availableFilter);

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
  }, [base, statusFilter, serviceFilter, priorityFilter, typeFilter, availableFilter, sort]);

  function resetFilters() {
    setStatusFilter(DEFAULT_FILTERS.status);
    setServiceFilter(DEFAULT_FILTERS.service);
    setPriorityFilter(DEFAULT_FILTERS.priority);
    setTypeFilter(DEFAULT_FILTERS.type);
    setAvailableFilter(DEFAULT_FILTERS.available);
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archive")}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="active">Active ({activeItems.length})</TabsTrigger>
            <TabsTrigger value="archive">Archive ({archivedItems.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-1">
            <Button
              variant="outline"
              className="h-9 gap-1.5 px-3 text-xs"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Toggle
              pressed={!compact}
              onPressedChange={() => updateCompact(false)}
              className="size-9"
            >
              <LayoutGrid className="size-4" />
            </Toggle>
            <Toggle
              pressed={compact}
              onPressedChange={() => updateCompact(true)}
              className="size-9"
            >
              <ListIcon className="size-4" />
            </Toggle>
          </div>
        </div>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <ListVideo className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {tab === "archive" ? "Nothing archived yet" : "Nothing here yet"}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {tab === "archive"
              ? "Titles you mark watched or dropped land here."
              : activeFilterCount > 0
                ? "No titles match your filters."
                : "Add something to watch from Search."}
          </p>
        </div>
      ) : compact ? (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <ListItemCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              compact
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => (
            <ListItemCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              compact={false}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters & sort</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <FilterField label="Status">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
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
            </FilterField>

            <FilterField label="Streaming service">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
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
            </FilterField>

            <FilterField label="Priority">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Type">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Movies & series</SelectItem>
                  <SelectItem value="MOVIE">Movies</SelectItem>
                  <SelectItem value="SERIES">Series</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Episode availability">
              <Select value={availableFilter} onValueChange={setAvailableFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">All episodes available</SelectItem>
                  <SelectItem value="false">Still airing</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Sort by">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateAdded">Date added</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="rating">IMDb rating</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="h-11 flex-1" onClick={resetFilters}>
              Clear filters
            </Button>
            <Button className="h-11 flex-1" onClick={() => setFiltersOpen(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
