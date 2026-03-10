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

export async function generateProblemDefinitionFromPdf(
  pdfBase64: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: PROBLEM_DEFINITION_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: "Here is the PDF of the discovery call transcript. Please produce the Problem Definition Document.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

const DEVELOPMENT_PLAN_PROMPT = `You are a technical lead at CrumbLabz, a company that builds custom software tools for businesses.

You have been given a Solution One-Pager for a client. Your job is to produce a **Development Plan** — a detailed but readable technical roadmap that guides the build.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then write in clean markdown format:

# Development Plan — [Client Company Name]

## MVP Scope
- The minimum set of features required to solve the core problem
- Feature list with priority ranking: **Must Have** / **Nice to Have** / **Future**
- Brief user story or workflow description for each Must Have feature

## Technical Architecture
- High-level system design overview
- **Frontend:** What the user-facing layer will look like (web app, dashboard, mobile, etc.)
- **Backend:** Server-side approach and key services
- **Database:** Data storage approach and key entities
- **Integrations:** Third-party APIs, services, or systems that need to connect
- **Hosting:** Where and how the solution will be deployed

## Development Phases

### Phase 1: MVP Build (Week 1–2)
- Detailed breakdown of what gets built in the initial sprint
- Key milestones and checkpoints

### Phase 2: Client Review & Refinements (Week 2–3)
- Demo to client
- Feedback incorporation
- Bug fixes and adjustments

### Phase 3: Production Hardening & Deployment
- Performance optimization
- Security review
- Deployment to production environment
- Client onboarding and training

## Assumptions & Dependencies
- What needs to be true for this plan to succeed
- Client-provided access, credentials, sample data, etc.
- Any third-party API availability or limitations

## Risk Register
- Known risks and their potential impact
- Mitigation strategy for each risk

## Success Metrics
- How we will measure whether the build is successful
- Tie back to the client's original success criteria from the Problem Definition

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Write clearly enough that both technical and non-technical stakeholders can follow. Use specific technology names where helpful but always explain what they do. This document should give the development team a clear roadmap and give the client confidence in the plan.`;

export async function generateDevelopmentPlan(
  solutionOnePager: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 5000,
    system: DEVELOPMENT_PLAN_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the Solution One-Pager:\n\n${solutionOnePager}`,
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

const CLAUDE_MD_PROMPT = `You are a senior developer at CrumbLabz, a company that builds custom software tools for businesses.

You have been given three project documents: a Problem Definition, a Solution One-Pager, and a Development Plan. Your job is to synthesize these into a CLAUDE.md file — a concise, developer-facing project context file that gives an AI coding assistant everything it needs to understand and build this project.

Output a clean markdown file with these sections:

# Project Overview
- One-paragraph summary of what this project is and who it's for
- The core problem being solved

# Tech Stack
- Frontend, backend, database, and hosting decisions from the Development Plan
- Third-party services and APIs required
- Key dependencies and frameworks

# Architecture
- High-level system design (components and how they connect)
- Data model overview (key entities and relationships)

# MVP Scope
- Prioritized feature list (Must Have / Nice to Have)
- What is explicitly OUT of scope for MVP

# Development Phases
- Phase breakdown with deliverables for each
- Key milestones

# Constraints & Requirements
- Security, compliance, or integration requirements
- Business rules that must be respected
- Performance expectations

# Success Criteria
- Measurable outcomes that define a successful build

Keep it concise and actionable. This is NOT a client-facing document — it's a technical reference for the development team and AI coding tools. Use bullet points, not prose. No branding or boilerplate.`;

export async function generateClaudeMd(
  problemDefinition: string,
  solutionOnePager: string,
  developmentPlan: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: CLAUDE_MD_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here are the three project documents:\n\n## Problem Definition\n\n${problemDefinition}\n\n## Solution One-Pager\n\n${solutionOnePager}\n\n## Development Plan\n\n${developmentPlan}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}
