import { BrevoClient } from '@getbrevo/brevo';
import 'dotenv/config';

// 1. Fail early if required environment variables are missing 
if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    throw new Error("Missing required mailer environment variables: BREVO_API_KEY or SENDER_EMAIL");
}

// 2. Instantiate the unified Brevo client correctly for the modern SDK 
const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

/**  
 * Sends a secure OTP verification email via Brevo with Spotify-themed HTML.  
 * @param {string} recipientEmail - The recipient's email address.  
 * @param {string|number} otp - The One-Time Password to send.  
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}  
 */
export const sendOtpEmail = async (recipientEmail: any, otp: any) => {
    try {
        const data = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Your Spotify Verification Code",
            sender: {
                name: "Spotify",
                email: process.env.SENDER_EMAIL
            },
            to: [{ email: recipientEmail }],
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
                      <h2 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Verify your account</h2>
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <p style="color: #B3B3B3; font-size: 15px; line-height: 1.5; margin: 0;">
                        Please use the following One-Time Password (OTP) to complete your verification setup.
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
                        This code is valid for <strong style="color: #FFFFFF;">5 minutes</strong>. 
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
      `
        });

        // Modern SDK returns the response properties directly     
        return { success: true, messageId: data.messageId };
    } catch (error: any) {
        // Log structured errors cleanly     
        console.error("Brevo Email Failure:", error.message || error);
        return { success: false, error: error.message || error };
    }
};
