import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://cal.com/crumblabz/discovery";

export async function POST(request: Request) {
  try {
    const { name, email, company, headache } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const firstName = (name || "").trim().split(" ")[0] || company || "there";

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "CrumbLabz <hello@crumblabz.com>",
      to: email,
      cc: ["thomas.ryan.crosby@gmail.com", "jpmeister95@gmail.com"],
      subject:
        "Thanks for reaching out to CrumbLabz — here's what happens next",
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
        Thanks for reaching out to CrumbLabz! We received your submission and we're excited to learn more about what's going on at <strong>${company || "your company"}</strong>.
      </p>

      ${
        headache
          ? `<div style="background:#f7f7f5;border-radius:8px;padding:16px;margin:0 0 16px;border-left:3px solid #e87a2e;">
        <p style="color:#6b6b6b;font-size:13px;font-weight:600;margin:0 0 4px;">What you told us:</p>
        <p style="color:#2d2d2d;font-size:14px;line-height:1.5;margin:0;">"${headache}"</p>
      </div>`
          : ""
      }

      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        <strong>Here's what happens next:</strong>
      </p>
      <ol style="color:#2d2d2d;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>We'll schedule a <strong>free 30-minute discovery call</strong> to understand your problem in detail.</li>
        <li>After that call, we'll produce a <strong>Problem Definition Document</strong> — a clear write-up of what we heard and what we'd recommend.</li>
        <li>If it makes sense to move forward, we'll build a <strong>Solution One-Pager</strong> and development plan. All of this is free — no commitment until you say go.</li>
      </ol>

      <div style="text-align:center;margin:24px 0;">
        <a href="${BOOKING_URL}" style="display:inline-block;background:#e87a2e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">
          Book Your Discovery Call
        </a>
      </div>

      <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:24px 0 0;text-align:center;">
        Can't find a time? Just reply to this email and we'll work something out.
      </p>
    </div>

    <!-- Support -->
    <div style="background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e0e0e0;margin-top:16px;">
      <p style="color:#2d2d2d;font-size:14px;line-height:1.6;margin:0 0 12px;">
        We're here to support you every step of the way. Have a question or just want to talk something through? Reach out anytime.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;">
            <p style="color:#2d2d2d;font-size:13px;margin:0;"><strong>Ryan Crosby</strong></p>
            <a href="mailto:thomas.ryan.crosby@gmail.com" style="color:#e87a2e;font-size:13px;text-decoration:none;">thomas.ryan.crosby@gmail.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <p style="color:#2d2d2d;font-size:13px;margin:0;"><strong>Josh Meister</strong></p>
            <a href="mailto:jpmeister95@gmail.com" style="color:#e87a2e;font-size:13px;text-decoration:none;">jpmeister95@gmail.com</a>
          </td>
        </tr>
      </table>
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
