import { STREAMING_SERVICES } from "@/lib/constants";
import type { TitleType } from "@prisma/client";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const REGION = "GB";

const CANONICAL_SERVICES = new Set<string>(STREAMING_SERVICES);

// Maps a TMDB provider's base name (after stripping channel-bundling
// suffixes) onto one of our canonical STREAMING_SERVICES labels.
// Built from real TMDB /watch/providers responses, not guesses.
const BASE_NAME_ALIASES: Record<string, string> = {
  MUBI: "Mubi",
  "Disney Plus": "Disney+",
  "Apple TV": "Apple TV+",
  "Now TV": "Sky Go / Now TV",
  "Now TV Cinema": "Sky Go / Now TV",
  "Sky Go": "Sky Go / Now TV",
  "Channel 4": "Channel 4 (4+)",
  "Channel 4 Plus": "Channel 4 (4+)",
  "ITVX Premium": "ITVX",
  "Amazon Prime Video": "Prime Video",
  "Amazon Prime Video with Ads": "Prime Video",
  "Amazon Prime Video Free with Ads": "Prime Video",
  "Paramount Plus": "Paramount+",
  "Paramount Plus Basic with Ads": "Paramount+",
  "Paramount Plus Premium": "Paramount+",
  "Netflix Standard with Ads": "Netflix",
  "Netflix Kids": "Netflix",
};

function normalizeProviderName(rawName: string): string | null {
  const base = rawName
    .replace(/\s+Amazon Channels?$/i, "")
    .replace(/\s+Apple TV Channel$/i, "")
    .trim();
  const mapped = BASE_NAME_ALIASES[base] ?? base;
  return CANONICAL_SERVICES.has(mapped) ? mapped : null;
}

function tmdbApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not configured");
  return key;
}

interface TmdbFindResponse {
  movie_results: Array<{ id: number }>;
  tv_results: Array<{ id: number }>;
}

interface TmdbProvider {
  provider_name: string;
}

interface TmdbDetailsResponse {
  status?: string;
  number_of_episodes?: number;
  number_of_seasons?: number;
  next_episode_to_air?: unknown;
  "watch/providers"?: {
    results?: Record<string, { flatrate?: TmdbProvider[]; ads?: TmdbProvider[]; free?: TmdbProvider[] }>;
  };
}

export interface TmdbEnrichment {
  streamingServices: string[];
  numberOfEpisodes: number | null;
  numberOfSeasons: number | null;
  allEpisodesAvailable: boolean | null;
}

const EMPTY_ENRICHMENT: TmdbEnrichment = {
  streamingServices: [],
  numberOfEpisodes: null,
  numberOfSeasons: null,
  allEpisodesAvailable: null,
};

export async function getTmdbEnrichment(
  imdbId: string,
  type: TitleType
): Promise<TmdbEnrichment> {
  try {
    const findUrl = new URL(`${TMDB_BASE_URL}/find/${imdbId}`);
    findUrl.searchParams.set("api_key", tmdbApiKey());
    findUrl.searchParams.set("external_source", "imdb_id");
    const findRes = await fetch(findUrl, { next: { revalidate: 0 } });
    const findData: TmdbFindResponse = await findRes.json();

    const mediaType = type === "SERIES" ? "tv" : "movie";
    const match = (type === "SERIES" ? findData.tv_results : findData.movie_results)?.[0];
    if (!match) return EMPTY_ENRICHMENT;

    const detailsUrl = new URL(`${TMDB_BASE_URL}/${mediaType}/${match.id}`);
    detailsUrl.searchParams.set("api_key", tmdbApiKey());
    detailsUrl.searchParams.set("append_to_response", "watch/providers");
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: 0 } });
    const details: TmdbDetailsResponse = await detailsRes.json();

    const region = details["watch/providers"]?.results?.[REGION];
    const names = new Set<string>();
    for (const p of [...(region?.flatrate ?? []), ...(region?.ads ?? []), ...(region?.free ?? [])]) {
      const mapped = normalizeProviderName(p.provider_name);
      if (mapped) names.add(mapped);
    }

    return {
      streamingServices: Array.from(names),
      numberOfEpisodes: type === "SERIES" ? details.number_of_episodes ?? null : null,
      numberOfSeasons: type === "SERIES" ? details.number_of_seasons ?? null : null,
      allEpisodesAvailable: type === "SERIES" ? details.next_episode_to_air == null : null,
    };
  } catch {
    return EMPTY_ENRICHMENT;
  }
}
