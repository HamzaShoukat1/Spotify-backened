import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { addSongToPlaylist, createPlaylist, deletePlaylist, getAvailableSongs, getPlaylist, getUserPlaylists, removeSongFromPlaylist, renamePlaylist } from "../Controllers/Playlist.Controller.js";
const router = Router();
router.use(verifyjwt);
router.get("/songs", getAvailableSongs);
router.post("/playlists", createPlaylist);
router.get("/playlists/user", getUserPlaylists);
router.get("/playlists/:id", getPlaylist);
router.patch("/playlists/:id", renamePlaylist);
router.delete("/playlists/:id", deletePlaylist);
router.post("/playlists/:id/songs", addSongToPlaylist);
router.delete("/playlists/:id/songs/:song_id", removeSongFromPlaylist);
export default router;
//# sourceMappingURL=Playlist.Route.js.map