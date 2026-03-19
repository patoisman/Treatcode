// Shared Resend email utility for Edge Functions
// Uses Resend REST API directly via native Deno fetch - no npm package needed

const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  return Deno.env.get("RESEND_FROM_EMAIL") || "Treatcode <noreply@treatcode.co.uk>";
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Resend API error:", error);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  const result = await response.json();
  console.log("Email sent:", result.id);
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

const formatAmount = (pence: number) => `£${(pence / 100).toFixed(2)}`;

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;`;
const purple = "#7c3aed";

export function buildAdminNotificationEmail(params: {
  userName: string;
  userEmail: string;
  brandName: string;
  amount: number;
}): string {
  return `
    <div style="${baseStyle}">
      <div style="background: ${purple}; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">New Voucher Request</h1>
      </div>
      <div style="padding: 32px;">
        <p>A user has requested a voucher. Details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b; width: 40%;">User</td>
            <td style="padding: 10px 0; font-weight: 600;">${params.userName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">Email</td>
            <td style="padding: 10px 0;">${params.userEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">Brand</td>
            <td style="padding: 10px 0; font-weight: 600;">${params.brandName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Amount</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 18px; color: ${purple};">${formatAmount(params.amount)}</td>
          </tr>
        </table>
        <p>Log in to the admin panel to fulfil this request.</p>
      </div>
    </div>
  `;
}

export function buildVoucherReadyEmail(params: {
  userName: string;
  brandName: string;
  amount: number;
  voucherCode: string;
  instructions: string | null;
}): string {
  return `
    <div style="${baseStyle}">
      <div style="background: ${purple}; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Your voucher is ready!</h1>
      </div>
      <div style="padding: 32px;">
        <p>Hi ${params.userName},</p>
        <p>Your <strong>${formatAmount(params.amount)} ${params.brandName}</strong> voucher is ready to use.</p>
        <div style="background: #f5f3ff; border: 2px solid ${purple}; border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your voucher code</p>
          <p style="margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 5px; color: ${purple}; font-family: monospace;">${params.voucherCode}</p>
        </div>
        ${params.instructions ? `<p style="color: #475569;"><strong>How to use:</strong> ${params.instructions}</p>` : ""}
        <p>You can also find this code anytime in your Treatcode account under <strong>Redeem Vouchers</strong>.</p>
        <p>Enjoy your treat!</p>
        <p style="color: #94a3b8;">The Treatcode Team</p>
      </div>
    </div>
  `;
}

export function buildRedemptionCancelledEmail(params: {
  userName: string;
  brandName: string;
  amount: number;
  reason: string | null;
}): string {
  return `
    <div style="${baseStyle}">
      <div style="background: #64748b; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Redemption Update</h1>
      </div>
      <div style="padding: 32px;">
        <p>Hi ${params.userName},</p>
        <p>Your request for a <strong>${formatAmount(params.amount)} ${params.brandName}</strong> voucher has been cancelled.</p>
        ${params.reason ? `<p style="color: #475569;"><strong>Reason:</strong> ${params.reason}</p>` : ""}
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #166534;"><strong>${formatAmount(params.amount)} has been returned to your Treatcode balance.</strong></p>
        </div>
        <p>If you have any questions, please get in touch with us.</p>
        <p style="color: #94a3b8;">The Treatcode Team</p>
      </div>
    </div>
  `;
}
