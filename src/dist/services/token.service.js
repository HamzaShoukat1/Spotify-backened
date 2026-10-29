import jwt from "jsonwebtoken";
export const generateAccessToken = function (payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || "", {
        expiresIn: "30d"
    });
};
export const generateRefreshToken = function (payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || '', {
        expiresIn: "7d"
    });
};
export const generateEmailChangeToken = function (userId) {
    return jwt.sign({ _id: userId, purpose: "change_email" }, process.env.EMAIL_TOKEN_SECRET || "", { expiresIn: "10m" });
};
export const verifyEmailChangeToken = function (token) {
    const payload = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET || "");
    if (payload.purpose !== "change_email") {
        throw new Error("Invalid email change token");
    }
    return payload;
};
//# sourceMappingURL=token.service.js.map