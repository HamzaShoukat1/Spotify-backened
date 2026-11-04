import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";

export type CreatePlaylistArgs = { name: string };

export async function createPlaylist(userId: string, args: CreatePlaylistArgs) {
    const name = typeof args.name === "string" ? args.name.trim() : "";
    if (name.length < 1 || name.length > 100)
        throw new Apierror(
            400,
            "Playlist name must be between 1 and 100 characters",
        );

    const playlist = await Playlist.create({ name, owner: userId, songs: [] });
    return {
        _id: playlist._id.toString(),
        name: playlist.name,
        owner: userId,
        songs: [],
    };
}

export function validateCreatePlaylistArgs(args: unknown): CreatePlaylistArgs {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
        throw new Apierror(400, "Invalid playlist arguments");
    }
    const value = args as Record<string, unknown>;
    if (typeof value.name !== "string")
        throw new Apierror(400, "Playlist name is required");
    return { name: value.name };
}
