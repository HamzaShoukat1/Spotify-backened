import mongoose from "mongoose";
import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";
import { z } from "zod";

const deletePlaylistArgsSchema = z.object({
  playlistId: z.string().trim().refine(mongoose.Types.ObjectId.isValid).optional(),
  playlistName: z.string().trim().min(1).optional(),
  all: z.boolean().optional(),
}).refine(
  (value) => value.all === true || Boolean(value.playlistId) !== Boolean(value.playlistName),
  "Provide exactly one playlist ID, playlist name, or all=true",
);

export type DeletePlaylistArgs = z.infer<typeof deletePlaylistArgsSchema>;

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
  const result = deletePlaylistArgsSchema.safeParse(args);
  if (!result.success) throw new Apierror(400, "Invalid delete playlist arguments");
  return result.data;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
