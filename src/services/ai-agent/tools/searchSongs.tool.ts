import { Music } from "../../../Models/music.model.js";
import { LikedSong } from "../../../Models/UserLikedSong.model.js";
import { Apierror } from "../../../utils/Apierror.js";
import { z } from "zod";

const stringOrList = z.union([z.string(), z.array(z.string())]).optional();
const searchSongsArgsSchema = z.object({
  query: z.string().optional(),
  genre: stringOrList,
  language: stringOrList,
  mood: stringOrList,
  limit: z.coerce.number().int().min(1).max(30).optional(),
  excludeLiked: z.preprocess(
    (value) => typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().optional(),
  ),
});

export type SearchSongsArgs = z.infer<typeof searchSongsArgsSchema>;

export async function searchSongs(userId: string, args: SearchSongsArgs) {
  const query = typeof args.query === "string" ? args.query.trim() : "";
  const genre = normalizeList(args.genre).slice(0, 5);
  const language = normalizeList(args.language)[0] ?? "";
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 30);

  const filters: Record<string, unknown>[] = [];
  if (query) {
    filters.push({
      $or: [
        { musicTitle: { $regex: query, $options: "i" } },
        { primaryArtistName: { $regex: query, $options: "i" } },
      ],
    });
  }
  if (genre.length) filters.push({ Genre: { $in: genre.map((item) => new RegExp(`^${escapeRegExp(item)}$`, "i")) } });
  if (language) filters.push({ Language: { $regex: `^${escapeRegExp(language)}$`, $options: "i" } });

  if (args.excludeLiked) {
    const liked = await LikedSong.find({ user: userId }).distinct("music");
    filters.push({ _id: { $nin: liked } });
  }

  const songs = await Music.find(filters.length ? { $and: filters } : {})
    .select("musicTitle primaryArtistName Genre Language coverPhoto.url music.url")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    songs: songs.map((song) => ({
      _id: song._id.toString(),
      musicTitle: song.musicTitle,
      primaryArtistName: song.primaryArtistName,
      genre: song.Genre,
      language: song.Language,
      coverPhoto: song.coverPhoto?.url,
    })),
    count: songs.length,
  };
}

export function validateSearchSongsArgs(args: unknown): SearchSongsArgs {
  const result = searchSongsArgsSchema.safeParse(args);
  if (!result.success) throw new Apierror(400, "Invalid search arguments");
  return result.data;
}

function normalizeList(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

