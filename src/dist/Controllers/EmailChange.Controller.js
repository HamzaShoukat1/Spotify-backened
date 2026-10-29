import { User } from "../Models/user.model.js";
import { Otp } from "../Models/Otp.model.js";
import { generateEmailChangeToken, verifyEmailChangeToken, } from "../services/token.service.js";
import { generateVerificationCode } from "../utils/generateverificationcode.js";
import { Apierror, Apiresponse, asynchandler } from "../utils/index.js";
import { sendOtpEmail } from "../utils/mailer.js";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 5;
async function sendAndSaveOtp(email, purpose) {
    const { code } = generateVerificationCode();
    await Otp.deleteMany({ email, purpose });
    await Otp.create({ email, otp: code, purpose });
    const mailResult = await sendOtpEmail(email, code, "change_email");
    if (!mailResult.success) {
        await Otp.deleteMany({ email, purpose, otp: code });
        throw new Apierror(503, mailResult.error || "Unable to send verification email");
    }
}
function checkTokenUserId(token, currentUserId) {
    try {
        const payload = verifyEmailChangeToken(token);
        if (payload._id !== currentUserId) {
            throw new Error("User mismatch");
        }
        return payload._id;
    }
    catch (err) {
        throw new Apierror(401, "Email verification has expired. Start again.");
    }
}
export const requestCurrentEmailOtp = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("email");
    if (!user) {
        throw new Apierror(404, "User not found");
    }
    await sendAndSaveOtp(user.email, "change_email_current");
    return res.status(200).json(new Apiresponse(200, {}, "Verification code sent to your current email"));
});
export const verifyCurrentEmailOtp = asynchandler(async (req, res) => {
    const otpInput = String(req.body?.otp || "").trim();
    const userId = req.user?._id;
    const user = await User.findById(userId).select("email");
    if (!user) {
        throw new Apierror(404, "User not found");
    }
    if (!/^\d{6}$/.test(otpInput)) {
        throw new Apierror(400, "Enter the six-digit verification code");
    }
    const otpRecord = await Otp.findOne({
        email: user.email,
        purpose: "change_email_current",
    });
    if (!otpRecord || otpRecord.attempts >= MAX_ATTEMPTS) {
        throw new Apierror(400, "Invalid or expired verification code");
    }
    otpRecord.attempts += 1;
    if (otpRecord.otp !== otpInput) {
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            await otpRecord.deleteOne();
        }
        else {
            await otpRecord.save();
        }
        throw new Apierror(400, "Invalid or expired verification code");
    }
    await otpRecord.save();
    const verificationToken = generateEmailChangeToken(user._id.toString());
    return res.status(200).json(new Apiresponse(200, { verificationToken }, "Current email verified"));
});
export const requestNewEmailOtp = asynchandler(async (req, res) => {
    const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();
    const verificationToken = String(req.body?.verificationToken || "");
    const userId = req.user?._id;
    const user = await User.findById(userId).select("email");
    if (!user) {
        throw new Apierror(404, "User not found");
    }
    checkTokenUserId(verificationToken, user._id.toString());
    if (!EMAIL_REGEX.test(newEmail)) {
        throw new Apierror(400, "Enter a valid email address");
    }
    if (newEmail === user.email) {
        throw new Apierror(400, "Enter an email different from your current email");
    }
    const emailExists = await User.exists({ email: newEmail });
    if (emailExists) {
        throw new Apierror(409, "That email is already in use");
    }
    await sendAndSaveOtp(newEmail, "change_email_new");
    return res.status(200).json(new Apiresponse(200, {}, "Verification code sent to your new email"));
});
export const confirmEmailChange = asynchandler(async (req, res) => {
    const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();
    const otpInput = String(req.body?.otp || "").trim();
    const verificationToken = String(req.body?.verificationToken || "");
    const userId = req.user?._id;
    const user = await User.findById(userId).select("email");
    if (!user) {
        throw new Apierror(404, "User not found");
    }
    checkTokenUserId(verificationToken, user._id.toString());
    if (!EMAIL_REGEX.test(newEmail) || !/^\d{6}$/.test(otpInput)) {
        throw new Apierror(400, "Enter a valid email and six-digit verification code");
    }
    const otpRecord = await Otp.findOne({
        email: newEmail,
        purpose: "change_email_new",
    });
    if (!otpRecord || otpRecord.attempts >= MAX_ATTEMPTS) {
        throw new Apierror(400, "Invalid or expired verification code");
    }
    otpRecord.attempts += 1;
    if (otpRecord.otp !== otpInput) {
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            await otpRecord.deleteOne();
        }
        else {
            await otpRecord.save();
        }
        throw new Apierror(400, "Invalid or expired verification code");
    }
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: user._id, email: user.email }, { $set: { email: newEmail } }, { returnDocument: "after", runValidators: true }).select("-password -refreshToken");
        if (!updatedUser) {
            throw new Apierror(409, "Your email changed already. Refresh and try again.");
        }
        await otpRecord.save();
        return res.status(200).json(new Apiresponse(200, updatedUser, "Email updated successfully"));
    }
    catch (error) {
        if (error?.code === 11000) {
            throw new Apierror(409, "That email is already in use");
        }
        throw error;
    }
});
//# sourceMappingURL=EmailChange.Controller.js.map