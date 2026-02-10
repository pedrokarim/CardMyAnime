const genreColorMap: Record<string, { bg: string; text: string }> = {
  Action: { bg: "bg-red-500/20", text: "text-red-400" },
  Adventure: { bg: "bg-orange-500/20", text: "text-orange-400" },
  Comedy: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  Drama: { bg: "bg-blue-500/20", text: "text-blue-400" },
  Fantasy: { bg: "bg-purple-500/20", text: "text-purple-400" },
  Horror: { bg: "bg-gray-500/20", text: "text-gray-400" },
  Mystery: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  Romance: { bg: "bg-pink-500/20", text: "text-pink-400" },
  "Sci-Fi": { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  "Slice of Life": { bg: "bg-green-500/20", text: "text-green-400" },
  Sports: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  Supernatural: { bg: "bg-violet-500/20", text: "text-violet-400" },
  Thriller: { bg: "bg-rose-500/20", text: "text-rose-400" },
  Ecchi: { bg: "bg-pink-600/20", text: "text-pink-500" },
  Mecha: { bg: "bg-zinc-500/20", text: "text-zinc-400" },
  Music: { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400" },
  Psychological: { bg: "bg-amber-500/20", text: "text-amber-400" },
  Mahou_Shoujo: { bg: "bg-pink-400/20", text: "text-pink-300" },
};

const defaultColor = { bg: "bg-slate-500/20", text: "text-slate-400" };

export function getGenreColor(genre: string): { bg: string; text: string } {
  return genreColorMap[genre] ?? defaultColor;
}
