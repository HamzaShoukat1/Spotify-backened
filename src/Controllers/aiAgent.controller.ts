import type { Response } from "express";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Apierror } from "../utils/Apierror.js";
import type { AuthenticatedRequest } from "../types/express-request.js";
import { processVoiceAgent } from "../services/ai-agent/agent.service.js";

export async function voiceAgent(req: AuthenticatedRequest, res: Response) {
    const file = req.file;
    const userId = req.user?._id?.toString();
    if (!file) throw new Apierror(400, "An audio file is required");
    if (!userId) throw new Apierror(401, "Unauthorized request");

    const result = await processVoiceAgent(userId, file);
    return res.status(200).json(new Apiresponse(200, result, "Voice request processed"));
}
