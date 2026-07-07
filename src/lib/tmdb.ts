import type { TitleType } from "@prisma/client";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const REGION = "GB";

interface TmdbFindResponse {
  movie_results: Array<{ id: number }>;
  tv_results: Array<{ id: number }>;
}

interface TmdbProvider {
  provider_name: string;
}

interface TmdbWatchProvidersResponse {
  results?: Record<string, { flatrate?: TmdbProvider[]; ads?: TmdbProvider[] }>;
}

const NAME_ALIASES: Record<string, string> = {
  "Amazon Prime Video": "Prime Video",
  "Disney Plus": "Disney+",
  "Apple TV Plus": "Apple TV+",
  "Paramount Plus": "Paramount+",
  "Now TV": "Sky Go / Now TV",
  "Sky Go": "Sky Go / Now TV",
  "Netflix Standard with Ads": "Netflix",
  "Channel 4": "Channel 4 (4+)",
};

function normalize(name: string) {
  return NAME_ALIASES[name] ?? name;
}

function tmdbApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not configured");
  return key;
}

export async function getStreamingServices(
  imdbId: string,
  type: TitleType
): Promise<string[]> {
  try {
    const findUrl = new URL(`${TMDB_BASE_URL}/find/${imdbId}`);
    findUrl.searchParams.set("api_key", tmdbApiKey());
    findUrl.searchParams.set("external_source", "imdb_id");
    const findRes = await fetch(findUrl, { next: { revalidate: 0 } });
    const findData: TmdbFindResponse = await findRes.json();

    const mediaType = type === "SERIES" ? "tv" : "movie";
    const match = (type === "SERIES" ? findData.tv_results : findData.movie_results)?.[0];
    if (!match) return [];

    const providersUrl = new URL(`${TMDB_BASE_URL}/${mediaType}/${match.id}/watch/providers`);
    providersUrl.searchParams.set("api_key", tmdbApiKey());
    const providersRes = await fetch(providersUrl, { next: { revalidate: 0 } });
    const providersData: TmdbWatchProvidersResponse = await providersRes.json();

    const region = providersData.results?.[REGION];
    if (!region) return [];

    const names = new Set<string>();
    for (const p of [...(region.flatrate ?? []), ...(region.ads ?? [])]) {
      names.add(normalize(p.provider_name));
    }
    return Array.from(names);
  } catch {
    return [];
  }
}
