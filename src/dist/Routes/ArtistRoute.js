import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { artistuploadmusicnumber, BecameAnArtist, GetArtistProfile, getPublicArtistDetails, getPublicArtists, UpdateArtistProfile } from "../Controllers/Artist.Controller.js";
import { upload } from "../Middlewares/upload.middleware.js";
const router = Router();
router.route("/create").post(verifyjwt, upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), BecameAnArtist);
router.route("/profile").get(verifyjwt, GetArtistProfile).patch(verifyjwt, upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), UpdateArtistProfile);
router.route("/profileforuser/:artistId").get(getPublicArtistDetails);
router.route("/public").get(getPublicArtists);
router.route("/getuploadedsongnumber").get(verifyjwt, artistuploadmusicnumber);
export default router;
//# sourceMappingURL=ArtistRoute.js.map