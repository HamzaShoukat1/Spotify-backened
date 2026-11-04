import { Router } from "express";
import { voiceAgent } from "../Controllers/aiAgent.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { asynchandler } from "../utils/Asynchandler.js";

const router = Router();
router.post("/voice", verifyjwt, upload.single("audio"), asynchandler(voiceAgent));
export default router;
