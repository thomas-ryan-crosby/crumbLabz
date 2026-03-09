# CrumbLabz Automation Playbook
Version 1.0

## Overview

This document describes the end-to-end automation stack that powers CrumbLabz's client engagement process. The goal: minimize manual work between "client fills out form" and "documents are ready for review."

---

## Architecture Summary

```
Contact Form → Firestore → Auto-Email (Resend) → Discovery Meeting (Google Meet + Fireflies)
                                                          ↓
                                                   Fireflies Webhook
                                                          ↓
                                                   Next.js API Route
                                                          ↓
                                                   Claude API (document generation)
                                                          ↓
                                                   Firestore (client documents subcollection)
                                                          ↓
                                                   Admin Dashboard (view/edit/approve)
```

---

## Tool Stack

| Function | Tool | Why |
|----------|------|-----|
| Contact form & CRM data | **Firebase Firestore** | Already in use, real-time, subcollections for docs |
| Automated emails | **Resend** | Simple API, great deliverability, React email templates, free tier (100 emails/day) |
| Meeting recording & transcript | **Fireflies.ai** | Already set up, has webhooks + API for transcript retrieval |
| AI document generation | **Claude API** (Anthropic) | Best for long-form structured document generation from transcripts |
| Webhook processing | **Next.js API Routes** (on Vercel) | Already deployed, serverless, no extra infra |
| Document storage | **Firestore subcollection** | Keeps documents attached to client profiles |
| Scheduling | **Cal.com** or **Calendly** | Embed booking link in auto-email, syncs with Google Calendar |

---

## Automation 1: Auto-Email on Form Submission

### How It Works
1. Client submits the contact form on crumblabz.com
2. Firestore document is created in the `contacts` collection
3. A Next.js API route (called from the client after form submission) sends a welcome email via Resend
4. The email includes: personalized greeting, what to expect next, and a link to book a discovery call

### Setup Steps

1. **Create a Resend account** at https://resend.com
   - Sign up (free tier: 100 emails/day, plenty for early stage)
   - Verify your sending domain: `crumblabz.com`
     - Go to Resend Dashboard → Domains → Add Domain
     - Add the DNS records (MX, SPF, DKIM) to your domain registrar
     - Wait for verification (usually minutes)
   - Create an API key: Settings → API Keys → Create
   - Add to your `.env.local`: `RESEND_API_KEY=re_xxxxxxxxxxxxx`

2. **Set up a scheduling tool** (recommended: Cal.com)
   - Create a free Cal.com account
   - Set up a "Discovery Call" event type (30 min, Google Meet)
   - Connect your Google Calendar
   - Get your booking link (e.g., `https://cal.com/crumblabz/discovery`)
   - Add to `.env.local`: `NEXT_PUBLIC_BOOKING_URL=https://cal.com/crumblabz/discovery`

3. **Install Resend package**
   ```bash
   cd website && npm install resend
   ```

4. **The API route and email template are already built** (see `/api/email/welcome` in the codebase)

### Email Content
- Subject: "Thanks for reaching out to CrumbLabz — here's what happens next"
- Body: Personalized greeting, recap of what they described, explanation of next steps (free solution design), booking link for discovery call
- From: hello@crumblabz.com (or whatever you verify with Resend)

---

## Automation 2: Fireflies Transcript → AI Document Generation

### How It Works
1. You hold a discovery meeting on Google Meet with Fireflies.ai recording
2. After the meeting, Fireflies processes the recording and generates a transcript
3. Fireflies sends a webhook to your API endpoint with the meeting ID
4. Your API route fetches the full transcript from Fireflies GraphQL API
5. The transcript is sent to Claude API with structured prompts
6. Claude generates the Problem Definition Document and Solution One-Pager
7. Documents are saved to the client's Firestore profile
8. The client's pipeline stage is auto-advanced to "Problem Definition"
9. Team is notified (optional: via email or Slack)

### Setup Steps

1. **Get Fireflies API credentials**
   - Log in to https://app.fireflies.ai
   - Go to Settings → Developer Settings → API Keys
   - Generate an API key
   - Add to `.env.local`: `FIREFLIES_API_KEY=your_key_here`

2. **Configure Fireflies webhook**
   - In Fireflies: Settings → Developer Settings → Webhooks
   - Add webhook URL: `https://crumblabz.com/api/webhooks/fireflies`
   - Select event: "Transcription completed"
   - This will POST to your endpoint whenever a meeting transcript is ready

3. **Get Claude API key**
   - Go to https://console.anthropic.com
   - Create an account and generate an API key
   - Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx`

4. **Install Anthropic SDK**
   ```bash
   cd website && npm install @anthropic-ai/sdk
   ```

5. **The webhook handler and document generation logic are already built** (see `/api/webhooks/fireflies` in the codebase)

### Fireflies GraphQL API — Fetching Transcripts

Fireflies uses a GraphQL API at `https://api.fireflies.ai/graphql`. Key query:

```graphql
query Transcript($transcriptId: String!) {
  transcript(id: $transcriptId) {
    id
    title
    date
    duration
    sentences {
      speaker_name
      text
    }
    summary {
      overview
      action_items
      keywords
    }
  }
}
```

### Claude Prompt Strategy

The transcript is processed in two passes:

**Pass 1: Problem Definition Document**
- System prompt defines the document structure (problem statement, current workflow, pain points, impact, success criteria)
- The full transcript is provided as context
- Claude extracts and structures the information

**Pass 2: Solution One-Pager**
- Takes the Problem Definition as input (not the raw transcript)
- Generates a concise, client-facing summary with proposed approach

Both documents are stored as markdown in Firestore and rendered in the admin UI.

### Matching Transcripts to Contacts

When the Fireflies webhook fires, the system needs to match the meeting to a contact. Options:
1. **Meeting title convention**: Name discovery calls "[CompanyName] Discovery Call" — the webhook handler searches contacts by company name
2. **Manual linking**: After the transcript arrives, a team member links it to a contact in the admin UI
3. **Calendar integration**: Match by attendee email (requires Cal.com webhook or Google Calendar API)

**Recommended for now**: Use option 1 (naming convention) with option 2 as fallback.

---

## Automation 3: Client Documents in the CRM

### Data Model

Each contact gets a `documents` subcollection in Firestore:

```
contacts/{contactId}/documents/{documentId}
  - title: string (e.g., "Problem Definition Document")
  - type: "problem_definition" | "solution_one_pager" | "development_plan" | "meeting_transcript" | "other"
  - content: string (markdown)
  - status: "draft" | "review" | "approved" | "sent"
  - generatedBy: "ai" | "manual"
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Admin UI Features
- Documents tab on the contact detail view
- View rendered markdown for each document
- Edit documents before sending to client
- Mark documents as approved/sent
- Generate new documents manually (trigger Claude API)

---

## Environment Variables Summary

Add these to your `.env.local` and Vercel environment settings:

```
# Already configured
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# New — email
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_BOOKING_URL=https://cal.com/crumblabz/discovery

# New — AI document generation
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# New — Fireflies integration
FIREFLIES_API_KEY=your_fireflies_api_key
FIREFLIES_WEBHOOK_SECRET=your_webhook_secret  # optional, for verifying webhook signatures
```

---

## Implementation Priority

### Phase 1 (Do Now)
1. Sign up for Resend, verify crumblabz.com domain
2. Set up Cal.com with a Discovery Call event
3. Deploy the welcome email automation (already built in codebase)
4. Test the full flow: form submit → email → booking link

### Phase 2 (This Week)
1. Get Fireflies API key and configure the webhook
2. Sign up for Claude API (Anthropic Console)
3. Deploy the Fireflies webhook handler
4. Test with a real discovery call recording
5. Review and refine the AI-generated document quality

### Phase 3 (Next Week)
1. Build the document editing UI in admin
2. Add "Send to Client" functionality (generate PDF, send via Resend)
3. Add document approval workflow
4. Refine Claude prompts based on real outputs

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Resend | 100 emails/day (3,000/mo) | $20/mo for 50k emails |
| Fireflies.ai | Already subscribed | Current plan |
| Claude API | Pay per use | ~$5-15/mo at early volume (est. 10-20 transcript analyses) |
| Cal.com | Free for individuals | $12/mo for team features |
| Vercel | Free tier | Current plan |
| Firebase | Free tier (Spark) | Free for current volume |

**Total additional cost: ~$5-15/mo** at current scale (mostly Claude API usage).

---

## Security Notes

- The Fireflies webhook endpoint should validate the webhook signature to prevent spoofing
- The Claude API key must NEVER be exposed client-side — only used in API routes (server-side)
- Resend API key is server-side only
- Client documents containing business details should be protected behind Firebase Auth (already in place)
- Consider adding Firestore security rules to restrict the `documents` subcollection to authenticated admin users
