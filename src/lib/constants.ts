export const STREAMING_SERVICES = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Apple TV+",
  "HBO Max",
  "Sky Go / Now TV",
  "BBC iPlayer",
  "ITVX",
  "Channel 4 (4+)",
  "Paramount+",
  "Mubi",
  "Shudder",
  "Cinema / Physical release",
  "Other",
] as const;

export const STREAMING_SERVICE_COLORS: Record<string, string> = {
  Netflix: "bg-[#E50914]/15 text-[#ff4d4d] border-[#E50914]/30",
  "Prime Video": "bg-[#00A8E1]/15 text-[#4fc3f7] border-[#00A8E1]/30",
  "Disney+": "bg-[#113CCF]/15 text-[#6e8fff] border-[#113CCF]/30",
  "Apple TV+": "bg-white/10 text-zinc-100 border-white/20",
  "HBO Max": "bg-[#9B0FE0]/15 text-[#c084fc] border-[#9B0FE0]/30",
  "Sky Go / Now TV": "bg-[#00285F]/20 text-[#7fa8e0] border-[#00285F]/40",
  "BBC iPlayer": "bg-black/30 text-zinc-100 border-white/20",
  ITVX: "bg-[#DA1E28]/15 text-[#ff6b6b] border-[#DA1E28]/30",
  "Channel 4 (4+)": "bg-[#0F0F0F]/40 text-zinc-100 border-white/20",
  "Paramount+": "bg-[#0064FF]/15 text-[#5c9dff] border-[#0064FF]/30",
  Mubi: "bg-[#0D0D0D]/40 text-zinc-100 border-white/20",
  Shudder: "bg-[#8B0000]/20 text-[#ff8080] border-[#8B0000]/40",
  "Cinema / Physical release": "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  Other: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: "High",
  2: "Medium",
  3: "Low",
};

export const WATCH_STATUS_LABELS: Record<string, string> = {
  UNWATCHED: "Unwatched",
  WATCHING: "Watching",
  WATCHED: "Watched",
  DROPPED: "Dropped",
};
