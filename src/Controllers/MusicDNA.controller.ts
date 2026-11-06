import type { Response } from "express";
import { getMusicDNA } from "../services/music-dna/musicDNA.service.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import type { AuthenticatedRequest } from "../types/express-request.js";
import { z } from "zod";

export async function getMusicDNAProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Apierror(401, "Unauthorized request");

  const refreshResult = z
    .enum(["true", "false"])
    .safeParse(req.query.refresh ?? "false");
  if (!refreshResult.success)
    throw new Apierror(400, "refresh must be true or false");

  const refresh = refreshResult.data === "true";
  const result = await getMusicDNA(userId, refresh);
  return res
    .status(200)
    .json(new Apiresponse(200, result, "Music DNA retrieved successfully"));
}
