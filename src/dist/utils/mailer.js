import 'dotenv/config';
const brevoEndpoint = "https://api.brevo.com/v3/smtp/email";
const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    if (!name || !domain)
        return "[invalid-email]";
    return `${name.slice(0, 2)}***@${domain}`;
};
/**
 * @param {string} recipientEmail - The recipient's email address.
 * @param {string|number} otp - The One-Time Password to send.
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export const sendOtpEmail = async (recipientEmail, otp, purpose = "verify") => {
    const maskedRecipient = maskEmail(recipientEmail);
    const subject = purpose === "change_email"
        ? "Confirm your Spotify email change"
        : "Your Spotify Verification Code";
    try {
        const brevoApiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL;
        if (!brevoApiKey || !senderEmail) {
            console.error("[Brevo] OTP email skipped: mailer is not configured", {
                recipient: maskedRecipient,
                purpose,
                missing: [
                    !brevoApiKey ? "BREVO_API_KEY" : null,
                    !senderEmail ? "BREVO_SENDER_EMAIL" : null,
                ].filter(Boolean),
            });
            return {
                success: false,
                error: "Mailer is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL",
            };
        }
        console.info("[Brevo] Sending OTP email", {
            recipient: maskedRecipient,
            purpose,
            subject,
        });
        const response = await fetch(brevoEndpoint, {
            method: "POST",
            headers: {
                accept: "application/json",
                "api-key": brevoApiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: { email: senderEmail, name: "Spotify" },
                to: [{ email: recipientEmail }],
                subject,
                htmlContent: `         
        <!DOCTYPE html>         
        <html lang="en">         
        <head>           
          <meta charset="UTF-8">           
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
        </head>         
        <body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">           
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121212; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #191414; border-radius: 8px; overflow: hidden; padding: 40px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                  
                  <!-- Logo Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <span style="color: #1DB954; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Spotify</span>
                    </td>
                  </tr>

                  <!-- Title -->
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                        <h2 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">${purpose === "change_email" ? "Confirm your email change" : "Verify your account"}</h2>
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <p style="color: #B3B3B3; font-size: 15px; line-height: 1.5; margin: 0;">
                        Please use the following One-Time Password (OTP) to ${purpose === "change_email" ? "confirm your email change" : "complete your verification setup"}.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Box -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="background-color: #282828; border: 1px solid #3E3E3E; border-radius: 6px; padding: 18px; width: 80%; text-align: center;">
                        <span style="color: #1DB954; font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">${otp}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Warning/Expiry Notice -->
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <p style="color: #B3B3B3; font-size: 13px; margin: 0;">
                        This code is valid for <strong style="color: #FFFFFF;">10 minutes</strong>.
                        For security, do not share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 20px 0;">
                      <hr style="border: 0; border-top: 1px solid #282828; margin: 0;" />
                    </td>
                  </tr>

                  <!-- Footer Disclaimer -->
                  <tr>
                    <td align="center">
                      <p style="color: #727272; font-size: 11px; line-height: 1.4; margin: 0;">
                        If you did not request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>         
        </html>       
          `,
            }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Brevo request failed with status ${response.status}`);
        }
        console.info("[Brevo] OTP email sent", {
            recipient: maskedRecipient,
            purpose,
            messageId: result.messageId,
        });
        return { success: true, messageId: result.messageId };
    }
    catch (error) {
        const errorMessage = error?.message || String(error);
        console.error("[Brevo] OTP email failed", {
            recipient: maskedRecipient,
            purpose,
            error: errorMessage,
            code: error?.code,
            statusCode: error?.response?.statusCode || error?.statusCode,
        });
        return { success: false, error: errorMessage };
    }
};
//# sourceMappingURL=mailer.js.map