import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  const code = otp.padEnd(4, '0').slice(0, 4);

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Boblo <onboarding@resend.dev>',
      to: email,
      subject: 'Your Boblo Verification Code',
      text: `Your Boblo verification code is: ${code}. This code will expire in 10 minutes.`,
      html: `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Email</title>
  <style>
    @media only screen and (max-width: 600px) {
      .main-card {
        padding: 28px 20px !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .otp-cell {
        width: 46px !important;
        height: 54px !important;
        font-size: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e7e9ea;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Main Card Container -->
        <table class="main-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 440px; background-color: #000000; border: 1px solid #2f3336; border-radius: 16px; padding: 32px 32px 28px 32px; margin: 0 auto;">

          <!-- Header / Logo -->
          <tr>
            <td align="left" style="padding-bottom: 28px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right: 8px; vertical-align: middle;">
                    <img src="https://abs.twimg.com/emoji/v2/72x72/1f680.png" width="20" height="20" alt="" style="display: block; width: 20px; height: 20px;" />
                  </td>
                  <td style="font-size: 17px; font-weight: 700; color: #e7e9ea; vertical-align: middle;">
                    Boblo
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title & Description -->
          <tr>
            <td align="left" style="padding-bottom: 24px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #e7e9ea;">
                Verify your email
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 21px; color: #71767b;">
                Enter this code to confirm it's you and finish signing in.
              </p>
            </td>
          </tr>

          <!-- Segmented OTP Box -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 6px 0;">
                <tr>
                  <td class="otp-cell" width="52" height="60" align="center" valign="middle" style="font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace; color: #ffffff; background-color: #16181c; border: 1px solid #2f3336; border-radius: 8px;">
                    ${code[0]}
                  </td>
                  <td class="otp-cell" width="52" height="60" align="center" valign="middle" style="font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace; color: #ffffff; background-color: #16181c; border: 1px solid #2f3336; border-radius: 8px;">
                    ${code[1]}
                  </td>
                  <td class="otp-cell" width="52" height="60" align="center" valign="middle" style="font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace; color: #ffffff; background-color: #16181c; border: 1px solid #2f3336; border-radius: 8px;">
                    ${code[2]}
                  </td>
                  <td class="otp-cell" width="52" height="60" align="center" valign="middle" style="font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace; color: #ffffff; background-color: #16181c; border: 1px solid #2f3336; border-radius: 8px;">
                    ${code[3]}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #2f3336; padding-bottom: 18px;"></td>
          </tr>

          <!-- Footer / Warning -->
          <tr>
            <td align="left">
              <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 19px; color: #71767b;">
                This code expires in <span style="color: #e7e9ea; font-weight: 600;">10 minutes</span>.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 19px; color: #71767b;">
                Didn't request this? You can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

        <!-- Bottom Meta Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 440px; margin: 0 auto;">
          <tr>
            <td align="center" style="padding-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #444444;">
                © ${new Date().getFullYear()} Boblo. All rights reserved.
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
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}
