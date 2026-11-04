import mongoose from "mongoose";
import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";

export type DeletePlaylistArgs = { playlistId?: string; playlistName?: string; all?: boolean };

export async function deletePlaylist(userId: string, args: DeletePlaylistArgs) {
  if (args.all) {
    const result = await Playlist.deleteMany({ owner: userId });
    return { deleted: true, deletedCount: result.deletedCount };
  }

  const filter = args.playlistId
    ? { _id: args.playlistId, owner: userId }
    : { owner: userId, name: new RegExp(`^${escapeRegExp(args.playlistName ?? "")}$`, "i") };
  const playlist = await Playlist.findOneAndDelete(filter);
  if (!playlist) throw new Apierror(404, "Playlist not found");

  return {
    deleted: true,
    playlistId: playlist._id.toString(),
    playlistName: playlist.name,
  };
}

export function validateDeletePlaylistArgs(args: unknown): DeletePlaylistArgs {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Apierror(400, "Invalid delete playlist arguments");
  }
  const value = args as Record<string, unknown>;
  const hasId = typeof value.playlistId === "string" && value.playlistId.trim().length > 0;
  const hasName = typeof value.playlistName === "string" && value.playlistName.trim().length > 0;
  const all = value.all === true;
  if (all) return { all: true };
  if (hasId === hasName) throw new Apierror(400, "Provide exactly one playlist ID or playlist name");
  if (hasId && !mongoose.Types.ObjectId.isValid(value.playlistId as string)) {
    throw new Apierror(400, "Playlist ID is invalid");
  }

  return hasId
    ? { playlistId: value.playlistId as string }
    : { playlistName: value.playlistName as string };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
