import { Router } from "express";
import {
  authorizeDownload,
  getEntitlement,
  confirmDownload,
  removeDownload,
  removeAllDownloads,
  getMyDownloads,
} from "../Controllers/Download.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.use(verifyjwt);

router.post("/authorize", authorizeDownload);
router.get("/entitlement", getEntitlement);
router.post("/confirm", confirmDownload);
router.get("/my-downloads", getMyDownloads);
router.delete("/all", removeAllDownloads);
router.delete("/:musicId", removeDownload);

export default router;
