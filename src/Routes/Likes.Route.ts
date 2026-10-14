import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { getLikedSongs, likeSong, unlikeSong } from "../Controllers/Like.Controller.js";











const router = Router()

// router.route("/toggle/:musicId").post(verifyjwt, LikedAndUnlikeSong)
// router.route("/getallikedsongs").get(verifyjwt, getLikedSongs)

router.put("/like/:musicId", verifyjwt, likeSong);
router.delete("/unlike/:musicId", verifyjwt, unlikeSong);
router.get("/liked", verifyjwt, getLikedSongs);




export default router