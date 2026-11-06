import { Playlist } from "../../../Models/playlist.model.js";
import { Apierror } from "../../../utils/Apierror.js";
import { z } from "zod";

const createPlaylistArgsSchema = z.object({
    name: z.string().trim().min(1).max(100),
});

export type CreatePlaylistArgs = z.infer<typeof createPlaylistArgsSchema>;

export async function createPlaylist(userId: string, args: CreatePlaylistArgs) {
    const name = args.name;

    const playlist = await Playlist.create({ name, owner: userId, songs: [] });
    return {
        _id: playlist._id.toString(),
        name: playlist.name,
        owner: userId,
        songs: [],
    };
};

export function validateCreatePlaylistArgs(args: unknown): CreatePlaylistArgs {
    const result = createPlaylistArgsSchema.safeParse(args);
    if (!result.success) throw new Apierror(400, "Invalid playlist arguments");
    return result.data;
};
