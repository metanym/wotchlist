"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Film, Star } from "lucide-react";

export interface TitleInfo {
  title: string;
  year: string | null;
  type: "MOVIE" | "SERIES";
  posterUrl: string | null;
  plot: string | null;
  genre: string | null;
  director: string | null;
  actors: string | null;
  imdbRating: string | null;
  rtScore: string | null;
  totalSeasons: string | null;
  totalEpisodes: number | null;
}

export function TitleInfoDialog({
  info,
  open,
  onOpenChange,
}: {
  info: TitleInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{info.title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
            {info.posterUrl ? (
              <Image
                src={info.posterUrl}
                alt={info.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">
              {info.year} · {info.type === "SERIES" ? "Series" : "Movie"}
              {info.type === "SERIES" && info.totalSeasons && (
                <>
                  {" · "}
                  {info.totalSeasons} {info.totalSeasons === "1" ? "Season" : "Seasons"}
                </>
              )}
              {info.type === "SERIES" && info.totalEpisodes && (
                <> · {info.totalEpisodes} Episodes</>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {info.imdbRating && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Star className="size-2.5 fill-current" />
                  {info.imdbRating}
                </Badge>
              )}
              {info.rtScore && (
                <Badge variant="outline" className="text-[10px]">
                  🍅 {info.rtScore}
                </Badge>
              )}
            </div>
            {info.genre && <p className="text-xs text-muted-foreground">{info.genre}</p>}
          </div>
        </div>

        {info.plot && <p className="text-sm leading-relaxed">{info.plot}</p>}

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {info.director && (
            <p>
              <span className="font-medium text-foreground">Director:</span> {info.director}
            </p>
          )}
          {info.actors && (
            <p>
              <span className="font-medium text-foreground">Cast:</span> {info.actors}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
