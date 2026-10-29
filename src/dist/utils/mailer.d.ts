import 'dotenv/config';
/**
 * @param {string} recipientEmail - The recipient's email address.
 * @param {string|number} otp - The One-Time Password to send.
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export declare const sendOtpEmail: (recipientEmail: string, otp: string, purpose?: "verify" | "change_email") => Promise<{
    success: boolean;
    messageId: string | undefined;
    error?: never;
} | {
    messageId?: never;
    success: boolean;
    error: any;
}>;
//# sourceMappingURL=mailer.d.ts.map