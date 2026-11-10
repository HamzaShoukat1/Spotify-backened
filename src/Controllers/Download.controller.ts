import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/express-request.js";
import { Music } from "../Models/music.model.js";
import { Download } from "../Models/download.model.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import {
  validateUserPremium,
  calculateOfflineEntitlement,
  generateSignedDownloadUrl,
  SIGNED_URL_EXPIRATION_SECONDS,
} from "../utils/download-auth.js";

export const authorizeDownload = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized: valid user session required");
    }

    const { musicId } = req.body as { musicId?: string };
    if (!musicId || !mongoose.isValidObjectId(musicId)) {
      throw new Apierror(400, "A valid musicId is required");
    }

    const { isPremium } = await validateUserPremium(userId);
    if (!isPremium) {
      throw new Apierror(
        403,
        "Premium subscription required for offline downloads"
      );
    }

    const song = await Music.findById(musicId).lean();
    if (!song) {
      throw new Apierror(404, "Song not found");
    }

    if (!song.music?.publicId) {
      throw new Apierror(400, "Song audio file is unavailable for download");
    }

    const signedDownloadUrl = generateSignedDownloadUrl(
      song.music.publicId,
      SIGNED_URL_EXPIRATION_SECONDS
    );

    const expiresAt = new Date(
      Date.now() + SIGNED_URL_EXPIRATION_SECONDS * 1000
    );

    const downloadRecord = await Download.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId), music: new mongoose.Types.ObjectId(musicId) },
      {
        $set: {
          musicTitle: song.musicTitle,
          primaryArtistName: song.primaryArtistName,
          coverPhotoUrl: song.coverPhoto?.url || "",
          status: "authorized",
          authorizedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    return res.status(200).json(
      new Apiresponse(
        200,
        {
          downloadId: downloadRecord._id,
          musicId: song._id,
          musicTitle: song.musicTitle,
          primaryArtistName: song.primaryArtistName,
          coverPhotoUrl: song.coverPhoto?.url,
          downloadUrl: signedDownloadUrl,
          expiresInSeconds: SIGNED_URL_EXPIRATION_SECONDS,
          expiresAt,
        },
        "Download authorized successfully"
      )
    );
  }
);

export const getEntitlement = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized");
    }

    const entitlement = await calculateOfflineEntitlement(userId);

    return res
      .status(200)
      .json(
        new Apiresponse(
          200,
          entitlement,
          "Offline entitlement retrieved successfully"
        )
      );
  }
);

export const confirmDownload = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized");
    }

    const { musicId, fileSize, duration } = req.body as {
      musicId?: string;
      fileSize?: number;
      duration?: number;
    };

    if (!musicId || !mongoose.isValidObjectId(musicId)) {
      throw new Apierror(400, "Valid musicId is required");
    }

    const record = await Download.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId), music: new mongoose.Types.ObjectId(musicId) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          ...(typeof fileSize === "number" ? { fileSize } : {}),
          ...(typeof duration === "number" ? { duration } : {}),
        },
      },
      { returnDocument: "after" }
    );

    if (!record) {
      throw new Apierror(404, "Download authorization record not found");
    }

    return res
      .status(200)
      .json(new Apiresponse(200, record, "Download confirmed successfully"));
  }
);

export const removeDownload = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized");
    }

    const musicId = Array.isArray(req.params.musicId) ? req.params.musicId[0] : req.params.musicId;
    if (!musicId || !mongoose.isValidObjectId(musicId)) {
      throw new Apierror(400, "Valid musicId is required");
    }

    await Download.findOneAndDelete({
      user: new mongoose.Types.ObjectId(userId),
      music: new mongoose.Types.ObjectId(musicId),
    });

    return res
      .status(200)
      .json(new Apiresponse(200, null, "Download record removed successfully"));
  }
);
export const removeAllDownloads = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized");
    }

    await Download.deleteMany({
      user: new mongoose.Types.ObjectId(userId),
    });

    return res
      .status(200)
      .json(new Apiresponse(200, null, "All download records removed successfully"));
  }
);

export const getMyDownloads = asynchandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Apierror(401, "Unauthorized");
    }

    const downloads = await Download.find({
      user: new mongoose.Types.ObjectId(userId),
      status: "completed",
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res
      .status(200)
      .json(new Apiresponse(200, downloads, "Downloads retrieved successfully"));
  }
);
