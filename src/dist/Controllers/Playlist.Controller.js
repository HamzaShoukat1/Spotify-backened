import mongoose from "mongoose";
import { Playlist } from "../Models/playlist.model.js";
import { Music } from "../Models/music.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
const playlistSongs = "musicTitle primaryArtistName coverPhoto.url";
const validId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Apierror(400, "Invalid ID format");
    }
};
export const createPlaylist = asynchandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim())
        throw new Apierror(400, "Playlist name is required");
    const playlist = await Playlist.create({
        name: name.trim(),
        owner: req.user?._id,
        songs: [],
    });
    res.status(201).json(new Apiresponse(201, playlist, "Playlist created"));
});
export const getUserPlaylists = asynchandler(async (req, res) => {
    const playlists = await Playlist.find({ owner: req.user?._id })
        .populate({ path: "songs", select: playlistSongs })
        .sort({ updatedAt: -1 })
        .lean();
    res.status(200).json(new Apiresponse(200, playlists, "Playlists retrieved"));
});
export const getPlaylist = asynchandler(async (req, res) => {
    const { id } = req.params;
    validId(id);
    const playlist = await Playlist.findOne({ _id: id, owner: req.user?._id })
        .populate({ path: "songs", select: playlistSongs })
        .lean();
    if (!playlist)
        throw new Apierror(404, "Playlist not found");
    res.status(200).json(new Apiresponse(200, playlist, "Playlist retrieved"));
});
export const renamePlaylist = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    validId(id);
    if (!name?.trim())
        throw new Apierror(400, "Playlist name is required");
    const playlist = await Playlist.findOneAndUpdate({ _id: id, owner: req.user?._id }, { name: name.trim() }, { new: true });
    if (!playlist)
        throw new Apierror(404, "Playlist not found");
    res.status(200).json(new Apiresponse(200, playlist, "Playlist renamed"));
});
export const deletePlaylist = asynchandler(async (req, res) => {
    const { id } = req.params;
    validId(id);
    const playlist = await Playlist.findOneAndDelete({ _id: id, owner: req.user?._id });
    if (!playlist)
        throw new Apierror(404, "Playlist not found");
    res.status(200).json(new Apiresponse(200, { _id: id }, "Playlist deleted"));
});
export const addSongToPlaylist = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { song_id } = req.body;
    validId(id);
    validId(song_id);
    const songExists = await Music.exists({ _id: song_id });
    if (!songExists)
        throw new Apierror(404, "Song not found");
    const playlist = await Playlist.findOneAndUpdate({ _id: id, owner: req.user?._id }, { $addToSet: { songs: song_id } }, { returnDocument: "after" }).populate({ path: "songs", select: playlistSongs });
    if (!playlist)
        throw new Apierror(404, "Playlist not found");
    res.status(200).json(new Apiresponse(200, playlist, "Song added to playlist"));
});
export const removeSongFromPlaylist = asynchandler(async (req, res) => {
    const { id, song_id } = req.params;
    validId(id);
    validId(song_id);
    const playlist = await Playlist.findOneAndUpdate({ _id: id, owner: req.user?._id }, { $pull: { songs: song_id } }, { returnDocument: "after" }).populate({ path: "songs", select: playlistSongs });
    if (!playlist)
        throw new Apierror(404, "Playlist not found");
    res.status(200).json(new Apiresponse(200, playlist, "Song removed from playlist"));
});
export const getAvailableSongs = asynchandler(async (_req, res) => {
    const songs = await Music.find()
        .select(playlistSongs)
        .sort({ createdAt: -1 })
        .lean().limit(20);
    res.status(200).json(new Apiresponse(200, songs, "Songs retrieved"));
});
//# sourceMappingURL=Playlist.Controller.js.map