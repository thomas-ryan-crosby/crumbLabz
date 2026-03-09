import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey: key });
}

const PROBLEM_DEFINITION_PROMPT = `You are a business analyst at CrumbLabz, a company that builds custom software tools for businesses.

You have been given the transcript of a discovery call with a potential client. Your job is to produce a **Problem Definition Document** in clean markdown format.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then include these sections:

# Problem Definition Document — [Client Company Name]

## Client Overview
- Company name, industry, and key contacts mentioned

## Problem Statement
- A clear, 2-3 sentence description of the core operational problem

## Current Workflow
- Step-by-step breakdown of how the process works today
- Tools and systems currently in use
- Manual steps involved

## Pain Points
- Specific inefficiencies, bottlenecks, and time sinks
- Error-prone steps
- Impact on team morale or customer experience

## Impact Assessment
- Estimated time wasted (per week/month if discussed)
- Cost implications (labor, errors, missed opportunities)
- Scale of the problem (how many people affected, frequency)

## Stakeholders
- Who is affected by the problem
- Who will use the solution
- Who are the decision makers

## Constraints & Requirements
- Technical constraints (existing systems, integrations needed)
- Business constraints (budget, timeline, compliance)
- Must-have vs nice-to-have requirements mentioned

## Success Criteria
- What does "solved" look like for this client?
- Measurable outcomes they mentioned or implied

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Be thorough but concise. Use bullet points. Write in professional but approachable language. If something wasn't discussed in the transcript, note it as "Not discussed — follow up needed" rather than making assumptions.`;

const SOLUTION_ONE_PAGER_PROMPT = `You are a solutions architect at CrumbLabz, a company that builds custom software tools for businesses.

You have been given a Problem Definition Document for a client. Your job is to produce a **Solution One-Pager** — a concise, client-facing summary that proposes a technical solution.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then write in clean markdown format:

# Solution One-Pager — [Client Company Name]

## The Problem
- 2-3 sentence summary of the core problem (written for a non-technical reader)

## Proposed Solution
- Plain-language description of what the tool will do
- How the user will interact with it (web app, dashboard, automation, etc.)
- Key workflows it will handle

## Key Features (MVP)
- Bulleted list of the minimum features needed to solve the core problem
- Mark each as "Must Have" or "Nice to Have"

## Expected Benefits
- Time saved
- Errors reduced
- Visibility gained
- Any other concrete improvements

## Technical Approach
- High-level technology stack (keep it simple — "web-based dashboard" not "Next.js with PostgreSQL")
- Integration points with existing systems
- Hosting and access approach

## Estimated Timeline
- MVP delivery estimate (typically 1-3 weeks for most CrumbLabz projects)
- Any phasing if applicable

## Recommended Engagement Model
- Solution Sale (one-time) or Monthly License (recurring) — recommend based on the nature of the solution
- Brief rationale for the recommendation

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Write for a business audience, not engineers. Keep it to one page when printed. Be specific enough to be useful but avoid jargon. This document should make the client feel confident that their problem is understood and solvable.`;

export async function generateProblemDefinition(
  transcript: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: PROBLEM_DEFINITION_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the transcript of the discovery call:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

export async function generateSolutionOnePager(
  problemDefinition: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: SOLUTION_ONE_PAGER_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the Problem Definition Document:\n\n${problemDefinition}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}
