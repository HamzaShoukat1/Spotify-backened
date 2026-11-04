import mongoose from "mongoose";
import { Music } from "../../../Models/music.model.js";
import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";

export type AddSongsArgs = {
  playlistId?: string;
  playlistName?: string;
  songIds: string[];
};

export async function addSongsToPlaylist(userId: string, args: AddSongsArgs) {
  if (args.songIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Apierror(400, "One or more song IDs are invalid");
  }
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
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Apierror(400, "Invalid add songs arguments");
  }
  const value = args as Record<string, unknown>;
  const hasPlaylistId =
    typeof value.playlistId === "string" && value.playlistId.trim().length > 0;
  const hasPlaylistName =
    typeof value.playlistName === "string" &&
    value.playlistName.trim().length > 0;
  if (
    hasPlaylistId === hasPlaylistName ||
    !Array.isArray(value.songIds) ||
    value.songIds.some((id) => typeof id !== "string")
  ) {
    throw new Apierror(
      400,
      "Provide exactly one playlist ID or playlist name and valid song IDs",
    );
  }
  if (
    hasPlaylistId &&
    !mongoose.Types.ObjectId.isValid(value.playlistId as string)
  ) {
    throw new Apierror(400, "Playlist ID is invalid");
  }
  const result: AddSongsArgs = { songIds: value.songIds as string[] };
  if (hasPlaylistId) result.playlistId = value.playlistId as string;
  if (hasPlaylistName) result.playlistName = value.playlistName as string;
  return result;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
