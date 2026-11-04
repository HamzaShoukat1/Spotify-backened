import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { getMusicDNAProfile } from "../Controllers/MusicDNA.controller.js";
import { asynchandler } from "../utils/Asynchandler.js";

const router = Router();
router.get("/music-dna", verifyjwt, asynchandler(getMusicDNAProfile));

export default router;
