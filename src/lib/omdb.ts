import { db } from "@/lib/db";
import { getTmdbEnrichment } from "@/lib/tmdb";
import type { TitleType } from "@prisma/client";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

export interface OmdbSearchResult {
  imdbId: string;
  title: string;
  year: string;
  type: TitleType;
  posterUrl: string | null;
  plot: string | null;
  genre: string | null;
  director: string | null;
  actors: string | null;
  imdbRating: string | null;
  rtScore: string | null;
  contentRating: string | null;
  runtimeMinutes: number | null;
  totalSeasons: string | null;
  totalEpisodes: number | null;
  allEpisodesAvailable: boolean | null;
  airingSeasonNumber: number | null;
  streamingServices: string[];
}

interface OmdbSearchResponse {
  Response: "True" | "False";
  Error?: string;
  totalResults?: string;
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
}

const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 2;

interface OmdbDetailResponse {
  Response: "True" | "False";
  Error?: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Plot: string;
  Genre: string;
  Director: string;
  Actors: string;
  imdbRating: string;
  Rated?: string;
  Runtime?: string;
  totalSeasons?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
}

function toTitleType(omdbType: string): TitleType {
  return omdbType === "series" ? "SERIES" : "MOVIE";
}

function omdbApiKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    throw new Error("OMDB_API_KEY is not configured");
  }
  return key;
}

function textOrNull(value: string | undefined) {
  return value && value !== "N/A" ? value : null;
}

function parseRuntimeMinutes(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function fetchSearchPage(query: string, page: number): Promise<OmdbSearchResponse> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", omdbApiKey());
  url.searchParams.set("s", query);
  url.searchParams.set("page", String(page));

  const res = await fetch(url, { next: { revalidate: 0 } });
  return res.json();
}

export async function searchTitles(query: string): Promise<OmdbSearchResult[]> {
  const firstPage = await fetchSearchPage(query, 1);

  if (firstPage.Response === "False" || !firstPage.Search) {
    return [];
  }

  const totalResults = Number(firstPage.totalResults ?? firstPage.Search.length);
  const pagesAvailable = Math.min(MAX_PAGES, Math.ceil(totalResults / RESULTS_PER_PAGE));

  const extraPages = await Promise.all(
    Array.from({ length: pagesAvailable - 1 }, (_, i) => fetchSearchPage(query, i + 2))
  );

  const allItems = [firstPage, ...extraPages].flatMap((page) => page.Search ?? []);
  const seen = new Set<string>();
  const dedupedItems = allItems.filter((item) => {
    if (seen.has(item.imdbID)) return false;
    seen.add(item.imdbID);
    return true;
  });

  const results = dedupedItems.map((item) => ({
    imdbId: item.imdbID,
    title: item.Title,
    year: item.Year,
    type: toTitleType(item.Type),
    posterUrl: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
  }));

  const [details, enrichments] = await Promise.all([
    Promise.all(results.map((r) => fetchDetail(r.imdbId).catch(() => null))),
    Promise.all(results.map((r) => getTmdbEnrichment(r.imdbId, r.type))),
  ]);

  return results.map((r, i) => {
    const detail = details[i];
    const enrichment = enrichments[i];
    return {
      ...r,
      posterUrl: r.posterUrl ?? enrichment.posterUrl,
      plot: detail ? textOrNull(detail.Plot) : null,
      genre: detail ? textOrNull(detail.Genre) : null,
      director: detail ? textOrNull(detail.Director) : null,
      actors: detail ? textOrNull(detail.Actors) : null,
      imdbRating: detail && detail.imdbRating !== "N/A" ? detail.imdbRating : null,
      rtScore: detail ? rtScoreFrom(detail.Ratings) : null,
      contentRating:
        r.type === "MOVIE"
          ? enrichment.ukCertification ?? (detail ? textOrNull(detail.Rated) : null)
          : null,
      runtimeMinutes: detail ? parseRuntimeMinutes(detail.Runtime) : null,
      totalSeasons: detail?.totalSeasons ?? null,
      totalEpisodes: enrichment.numberOfEpisodes,
      allEpisodesAvailable: enrichment.allEpisodesAvailable,
      airingSeasonNumber: enrichment.airingSeasonNumber,
      streamingServices: enrichment.streamingServices,
    };
  });
}

async function fetchDetail(imdbId: string): Promise<OmdbDetailResponse | null> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", omdbApiKey());
  url.searchParams.set("i", imdbId);
  url.searchParams.set("plot", "full");

  const res = await fetch(url, { next: { revalidate: 0 } });
  const data: OmdbDetailResponse = await res.json();
  if (data.Response === "False") return null;
  return data;
}

function rtScoreFrom(ratings: OmdbDetailResponse["Ratings"]) {
  return ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ?? null;
}

export async function upsertTitle(imdbId: string) {
  const existing = await db().title.findUnique({ where: { imdbId } });

  const isStale =
    !existing?.metaFetchedAt ||
    Date.now() - existing.metaFetchedAt.getTime() > STALE_AFTER_MS;

  if (existing && !isStale) {
    return existing;
  }

  const detail = await fetchDetail(imdbId);
  if (!detail) {
    if (existing) return existing;
    throw new Error("Title not found on OMDB");
  }

  const type = toTitleType(detail.Type);
  const enrichment = await getTmdbEnrichment(imdbId, type);

  const data = {
    title: detail.Title,
    year: detail.Year,
    type,
    posterUrl: textOrNull(detail.Poster) ?? enrichment.posterUrl,
    plot: textOrNull(detail.Plot),
    imdbRating: detail.imdbRating !== "N/A" ? detail.imdbRating : null,
    rtScore: rtScoreFrom(detail.Ratings),
    contentRating:
      type === "MOVIE" ? enrichment.ukCertification ?? textOrNull(detail.Rated) : null,
    runtimeMinutes: parseRuntimeMinutes(detail.Runtime),
    genre: textOrNull(detail.Genre),
    director: textOrNull(detail.Director),
    actors: textOrNull(detail.Actors),
    totalSeasons: detail.totalSeasons,
    totalEpisodes: enrichment.numberOfEpisodes,
    airingSeasonNumber: enrichment.airingSeasonNumber,
    metaFetchedAt: new Date(),
  };

  return db().title.upsert({
    where: { imdbId },
    create: { imdbId, ...data },
    update: data,
  });
}
