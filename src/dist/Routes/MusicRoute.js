import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { AddMusic, getdetailsfortracksplaying, getMusicDataForHome, getRecentlyPlayedSongs } from "../Controllers/Music.Controller.js";
const router = Router();
router.route("/add").post(verifyjwt, upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
]), AddMusic);
router.route("/musicdetailforhome").get(getMusicDataForHome);
router.route("/track/:musicId").get(getdetailsfortracksplaying);
router.route("/getrecentPlayingSong").get(verifyjwt, getRecentlyPlayedSongs);
export default router;
//# sourceMappingURL=MusicRoute.js.map