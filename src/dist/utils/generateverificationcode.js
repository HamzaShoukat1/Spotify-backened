import crypto from "crypto";
export const generateVerificationCode = () => {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return { code, expiresAt };
};
//# sourceMappingURL=generateverificationcode.js.map