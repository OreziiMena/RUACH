import { resend } from "."

const BASE_URL = process.env.ROOT_DOMAIN;

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const { data, error } = await resend.emails.send({
    from: `RUACH H. FASHION <noreply@${process.env.DOMAIN}>`,
    to: [email],
    subject: "Password Reset Request",
    html: `<p>You have requested a password reset. Click the link below to reset your password:</p>
            <p><a href="${BASE_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>`,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error('Failed to send password reset email');
  }

  return { data };
};