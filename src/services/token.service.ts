import jwt from "jsonwebtoken";
import type { TokenPayLoad } from "../types/types.js";

export const generateAccessToken = function (payload: TokenPayLoad) {
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET || "",
        {
            expiresIn: "30d"
        }
    )

}


export const generateRefreshToken = function (payload: TokenPayLoad) {
    return jwt.sign(
        payload,

        process.env.REFRESH_TOKEN_SECRET || '',
        {
            expiresIn: "7d"
        }
    )

};