import type { TokenPayLoad } from "../types/types.js"
import jwt from "jsonwebtoken"
import { asynchandler, Apierror } from "../utils/index.js"
import { User } from "../Models/user.model.js"

export const verifyjwt = asynchandler(async (req, _res, next) => {
    //get token
    //verify token
    //extrcat user
 

        const token = req.header("Authorization")?.replace("Bearer ", "") ||
                  req.header("authorization")?.replace("Bearer ", "")


    if (!token) {
        throw new Apierror(401, "Unauthorized request")
    }

    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayLoad

    const user = await User
        .findById(decoded._id)
        .select("-password -refreshToken")

    if (!user) {
        throw new Apierror(401, "Invalid access token")
    }

    req.user = user
    next()
})