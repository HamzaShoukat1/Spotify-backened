import { Router } from "express";

import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { completeListening, getArtistDashboard, startListening, trackStream } from "../Controllers/Analytics.Controller.js";

const router = Router()
router.post('/music', verifyjwt, trackStream);
router.post('/start', verifyjwt, startListening);
router.post('/complete', verifyjwt, completeListening);

router.get('/analytics', verifyjwt, getArtistDashboard);

export default router
