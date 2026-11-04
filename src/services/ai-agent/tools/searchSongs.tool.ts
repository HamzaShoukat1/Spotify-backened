import { Music } from "../../../Models/music.model.js";
import { LikedSong } from "../../../Models/UserLikedSong.model.js";
import { Apierror } from "../../../utils/Apierror.js";

export type SearchSongsArgs = {
  query?: string;
  genre?: string[] | string;
  language?: string[] | string;
  mood?: string[] | string;
  limit?: number;
  excludeLiked?: boolean;
};

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
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Apierror(400, "Invalid search arguments");
  }
  const value = args as Record<string, unknown>;
  if (value.genre !== undefined && (typeof value.genre !== "string" && (!Array.isArray(value.genre) || value.genre.some((item) => typeof item !== "string")))) {
    throw new Apierror(400, "Genre must be an array of strings");
  }
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit))) {
    throw new Apierror(400, "Limit must be an integer");
  }
  const result = value as SearchSongsArgs;
  if (value.excludeLiked !== undefined && typeof value.excludeLiked !== "boolean") {
    result.excludeLiked = String(value.excludeLiked).toLowerCase() === "true";
  }
  return result;
}

function normalizeList(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

