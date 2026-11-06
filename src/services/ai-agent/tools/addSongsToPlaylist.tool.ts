import mongoose from "mongoose";
import { Music } from "../../../Models/music.model.js";
import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";
import { z } from "zod";

const addSongsArgsSchema = z.object({
  playlistId: z.string().trim().refine(mongoose.Types.ObjectId.isValid).optional(),
  playlistName: z.string().trim().min(1).optional(),
  songIds: z.array(z.string().trim().refine(mongoose.Types.ObjectId.isValid)).min(1).max(50),
}).refine(
  (value) => Boolean(value.playlistId) !== Boolean(value.playlistName),
  "Provide exactly one playlist ID or playlist name",
);

export type AddSongsArgs = z.infer<typeof addSongsArgsSchema>;

export async function addSongsToPlaylist(userId: string, args: AddSongsArgs) {
  const songIds = [...new Set(args.songIds)];
  if (!songIds.length || songIds.length > 50)
    throw new Apierror(400, "Provide between 1 and 50 valid songs");

  const playlist = args.playlistId
    ? await Playlist.findOne({ _id: args.playlistId, owner: userId })
    : await Playlist.findOne({
      owner: userId,
      name: new RegExp(`^${escapeRegExp(args.playlistName ?? "")}$`, "i"),
    }).sort({ createdAt: -1 });
  if (!playlist) throw new Apierror(404, "Playlist not found");

  const songs = await Music.find({ _id: { $in: songIds } })
    .select("_id")
    .lean();
  if (songs.length !== songIds.length)
    throw new Apierror(400, "One or more songs are invalid");

  const existing = new Set(playlist.songs.map((song) => song.toString()));
  const newSongIds = songIds.filter((id) => !existing.has(id));
  if (newSongIds.length) {
    playlist.songs.push(
      ...newSongIds.map((id) => new mongoose.Types.ObjectId(id)),
    );
    await playlist.save();
  }

  const updated = await Playlist.findById(playlist._id)
    .populate(
      "songs",
      "musicTitle primaryArtistName Genre Language coverPhoto.url",
    )
    .lean();
  return updated;
}

export function validateAddSongsArgs(args: unknown): AddSongsArgs {
  const result = addSongsArgsSchema.safeParse(args);
  if (!result.success) throw new Apierror(400, "Invalid add songs arguments");
  return result.data;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
