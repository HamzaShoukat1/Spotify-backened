import { Router } from "express";

import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { getArtistDashboard, trackStream } from "../Controllers/Analytics.Controller.js";

const router = Router()
router.post('/music', verifyjwt, trackStream);

router.get('/analytics', verifyjwt, getArtistDashboard);

export default router
