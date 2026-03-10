import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

export async function POST(request: Request) {
  try {
    const { contactName, contactEmail, companyName, reviewUrl } = await request.json();

    if (!contactName || !contactEmail || !reviewUrl) {
      return NextResponse.json(
        { error: "contactName, contactEmail, and reviewUrl are required" },
        { status: 400 }
      );
    }

    const firstName = contactName.split(" ")[0];

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "CrumbLabz <hello@crumblabz.com>",
      to: contactEmail,
      subject: `${companyName || "Your"} project documents are ready for review`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#2d2d2d;font-size:22px;font-weight:700;margin:0;">CrumbLabz</h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e0e0e0;">
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${firstName},
      </p>
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Great news — your project documents for <strong>${companyName || "your project"}</strong> are ready for your review.
      </p>

      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 8px;">
        <strong>We've prepared three documents for you:</strong>
      </p>
      <ol style="color:#2d2d2d;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li><strong>Problem Definition</strong> — a clear write-up of the problem we're solving</li>
        <li><strong>Solution One-Pager</strong> — our proposed approach and key features</li>
        <li><strong>Development Plan</strong> — the technical roadmap and timeline</li>
      </ol>

      <p style="color:#2d2d2d;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Please review each document and either <strong>approve</strong> it or leave <strong>comments</strong> with any feedback. Once all three are approved, we'll kick off development.
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${reviewUrl}" style="display:inline-block;background:#e87a2e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">
          Review Your Documents
        </a>
      </div>

      <p style="color:#6b6b6b;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center;">
        This link expires in 14 days. If you have questions, just reply to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;">
      <p style="color:#6b6b6b;font-size:12px;margin:0;">
        CrumbLabz &mdash; Custom Tools for Smarter Operations
      </p>
      <p style="color:#6b6b6b;font-size:12px;margin:4px 0 0;">
        <a href="https://crumblabz.com" style="color:#e87a2e;text-decoration:none;">crumblabz.com</a>
      </p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
