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
    const { contactName, contactEmail, emails, companyName, reviewType, portalUrl } = await request.json();

    // Support both single email (legacy) and array of emails
    const recipientEmails: string[] = emails && Array.isArray(emails) && emails.length > 0
      ? emails
      : contactEmail ? [contactEmail] : [];

    if (!contactName || recipientEmails.length === 0 || !portalUrl) {
      return NextResponse.json(
        { error: "contactName, emails, and portalUrl are required" },
        { status: 400 }
      );
    }

    const firstName = (contactName || "").trim().split(" ")[0] || companyName || "there";
    const isSolutionReview = reviewType === "solution_assets";

    const subject = isSolutionReview
      ? `${companyName || "Your"} solution — first version ready for your feedback`
      : `${companyName || "Your"} project documents are ready for review`;

    const body = isSolutionReview
      ? `
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${firstName},
      </p>
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        The first version of your solution for <strong>${companyName || "your project"}</strong> is ready. We want to be upfront — this is a <strong>Version 1</strong>. It may not be perfect yet, and that's by design. Our goal is to get a working tool in your hands quickly so you can start using it and tell us what to improve.
      </p>

      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 8px;">
        <strong>What we've prepared:</strong>
      </p>
      <ol style="color:#2d2d2d;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li><strong>Solution Overview</strong> — what was built and how it works</li>
        <li><strong>Getting Started Guide</strong> — step-by-step instructions to get up and running</li>
      </ol>
      `
      : `
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${firstName},
      </p>
      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Great news — your project documents for <strong>${companyName || "your project"}</strong> are ready. We've put together the key documents that outline what we heard, what we'd recommend, and how we'd build it.
      </p>

      <p style="color:#2d2d2d;font-size:16px;line-height:1.6;margin:0 0 8px;">
        <strong>What's inside:</strong>
      </p>
      <ol style="color:#2d2d2d;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li><strong>Problem Definition</strong> — a write-up of the problem we're solving</li>
        <li><strong>Solution One-Pager</strong> — our proposed approach and key features</li>
        <li><strong>Development Plan</strong> — the technical roadmap</li>
      </ol>

      <p style="color:#2d2d2d;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Take a look when you get a chance and let us know your thoughts — no formal approvals needed, just your feedback so we can make sure we're on the right track.
      </p>
      `;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "CrumbLabz <hello@crumblabz.com>",
      to: recipientEmails,
      cc: ["thomas.ryan.crosby@gmail.com", "jpmeister95@gmail.com"],
      subject,
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
      ${body}

      <div style="text-align:center;margin:24px 0;">
        <a href="${portalUrl}" style="display:inline-block;background:#e87a2e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">
          Open Your Client Portal
        </a>
      </div>

      <!-- Portal overview -->
      <div style="background:#f7f7f5;border-radius:8px;padding:16px;margin:24px 0 0;">
        <p style="color:#2d2d2d;font-size:14px;font-weight:600;margin:0 0 8px;">What is the Client Portal?</p>
        <p style="color:#6b6b6b;font-size:13px;line-height:1.6;margin:0;">
          Your portal is a simple place to keep everything about your project in one spot — documents, meeting notes, feature requests, and progress updates. Your link never expires, so you can come back anytime.
        </p>
      </div>
    </div>

    <!-- Support -->
    <div style="background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e0e0e0;margin-top:16px;">
      <p style="color:#2d2d2d;font-size:14px;line-height:1.6;margin:0 0 12px;">
        We're here to support you every step of the way. Have a question, want to talk something through, or just need a hand? Reach out anytime.
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
      <div style="text-align:center;margin-top:12px;">
        <a href="${BOOKING_URL}" style="color:#e87a2e;font-size:13px;font-weight:600;text-decoration:none;">
          Book a Meeting &rarr;
        </a>
      </div>
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
