import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { createAlbum, getAlbumById, getAlbums } from "../Controllers/Album.Controller.js";

const router = Router();

router.post(
  "/",
  verifyjwt,
  upload.fields([
    { name: "coverPhoto", maxCount: 1 },
    { name: "tracks", maxCount: 50 },
  ]),
  createAlbum,
);
router.get("/", getAlbums);
router.get("/:albumId", getAlbumById);

export default router;