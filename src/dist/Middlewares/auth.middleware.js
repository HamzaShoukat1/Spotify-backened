import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../Models/user.model.js";
import { Session } from "../Models/session.model.js";
import { asynchandler, Apierror } from "../utils/index.js";
export const verifyjwt = asynchandler(async (req, _res, next) => {
    const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
        throw new Apierror(401, "Unauthorized request");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded._id ||
        !decoded.sessionId ||
        !mongoose.Types.ObjectId.isValid(decoded._id) ||
        !mongoose.Types.ObjectId.isValid(decoded.sessionId)) {
        throw new Apierror(401, "Invalid access token");
    }
    const session = await Session.findOne({
        _id: decoded.sessionId,
        userId: decoded._id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }).select("_id");
    if (!session) {
        throw new Apierror(401, "Session expired or revoked");
    }
    const user = await User.findById(decoded._id)
        .select("-password -refreshToken")
        .lean();
    if (!user) {
        throw new Apierror(401, "Invalid access token");
    }
    req.user = {
        ...user,
        _id: user._id.toString(),
        sessionId: decoded.sessionId,
    };
    next();
});
//# sourceMappingURL=auth.middleware.js.map