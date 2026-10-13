import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { getLikedSongs, LikedAndUnlikeSong } from "../Controllers/Like.Controller.js";











const router = Router()

router.route("/toggle/:musicId").post(verifyjwt, LikedAndUnlikeSong)
router.route("/getallikedsongs").get(verifyjwt, getLikedSongs)




export default router