"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Film, Star, X, Info, CheckCircle2, Clock } from "lucide-react";
import type { OmdbSearchResult } from "@/lib/omdb";
import { searchAction } from "./actions";
import { AddToListSheet } from "@/components/add-to-list/add-to-list-sheet";
import { TitleInfoDialog } from "@/components/title-info-dialog";
import { STREAMING_SERVICE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OmdbSearchResult[]>([]);
  const [selected, setSelected] = useState<OmdbSearchResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [infoTarget, setInfoTarget] = useState<OmdbSearchResult | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const handle = setTimeout(() => {
      setHasSearched(true);
      startTransition(async () => {
        const { results: data, error } = await searchAction(trimmed);
        if (error) toast.error(error);
        setResults(data);
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a film or series…"
          className="h-11 pl-9 pr-9"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isPending && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-2/3 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isPending && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Film className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No matches</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Try a different title or check the spelling.
          </p>
        </div>
      )}

      {!isPending && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((result) => (
            <div key={result.imdbId} className="flex flex-col gap-1.5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelected(result);
                  setSheetOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(result);
                    setSheetOpen(true);
                  }
                }}
                className="flex cursor-pointer flex-col gap-1.5 text-left"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-muted">
                  {result.posterUrl ? (
                    <Image
                      src={result.posterUrl}
                      alt={result.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoTarget(result);
                      setInfoOpen(true);
                    }}
                    aria-label="View synopsis"
                    className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-background/80 backdrop-blur"
                  >
                    <Info className="size-4" />
                  </button>
                  {result.type === "SERIES" && result.allEpisodesAvailable !== null && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-background/80 px-1.5 py-0.5 backdrop-blur">
                      {result.allEpisodesAvailable ? (
                        <CheckCircle2 className="size-3 text-emerald-500" />
                      ) : (
                        <Clock className="size-3 text-amber-500" />
                      )}
                      <span className="text-[9px] font-medium">
                        {result.allEpisodesAvailable ? "All available" : "Still airing"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="truncate text-sm font-medium leading-tight">{result.title}</p>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs text-muted-foreground">{result.year}</span>
                  <Badge variant="outline" className="h-4 px-1 text-[10px]">
                    {result.type === "SERIES" ? "Series" : "Movie"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {result.imdbRating && (
                    <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[10px]">
                      <Star className="size-2.5 fill-current" />
                      {result.imdbRating}
                    </Badge>
                  )}
                  {result.rtScore && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px]">
                      🍅 {result.rtScore}
                    </Badge>
                  )}
                  {result.type === "SERIES" && result.totalSeasons && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px]">
                      {result.totalSeasons}
                      {result.totalSeasons === "1" ? " Season" : " Seasons"}
                      {result.totalEpisodes ? ` · ${result.totalEpisodes} Ep` : ""}
                    </Badge>
                  )}
                </div>
                {result.streamingServices.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {result.streamingServices.map((service) => (
                      <Badge
                        key={service}
                        className={cn(
                          "h-4 border px-1 text-[10px]",
                          STREAMING_SERVICE_COLORS[service] ?? ""
                        )}
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddToListSheet title={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
      <TitleInfoDialog info={infoTarget} open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
}
