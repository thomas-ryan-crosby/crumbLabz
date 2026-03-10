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

const SOLUTION_OVERVIEW_PROMPT = `You are a technical writer at CrumbLabz, a company that builds custom software tools for businesses.

You have been given the contents of a GitHub repository — including file tree structure and key file contents. Your job is to produce a **Solution Overview** — an intuitive, client-facing technical document that explains what was built, how it works, and how to use it.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then write in clean markdown format:

# Solution Overview — [Project Name]

## What We Built
- Plain-language summary of the solution (2-3 sentences)
- Who it's for and what problem it solves

## How It Works
- High-level walkthrough of the user experience
- Key screens or workflows described step by step
- Include what happens behind the scenes in simple terms

## Technology Stack
- Frontend framework and UI libraries
- Backend / API layer
- Database and data storage
- Hosting and deployment
- Third-party services and integrations
- For each technology, include a brief explanation of WHY it was chosen and what it does

## Key Features
- Feature-by-feature breakdown with descriptions
- How each feature benefits the user
- Any configuration or customization options

## Getting Started
- How to access the application (URL, login, etc.)
- First-time setup or onboarding steps
- Key things to know before using the tool

## Architecture Overview
- Simple diagram description of how components connect
- Data flow: how information moves through the system
- Integration points with external services

## API & Integrations
- List of external APIs or services used
- What each integration does
- Any credentials or access requirements

## Maintenance & Support
- How the solution is hosted and monitored
- Update and deployment process
- How to get support or request changes

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Write for a non-technical business audience. Make it feel like a product manual, not source code documentation. The reader should finish this document understanding exactly what they have, how to use it, and what technologies power it — without needing to read code. Be specific about the actual technologies found in the repository.

IMPORTANT: If a "Live Deployment URL" is provided in the input, use that exact URL in the document. Do NOT use placeholder text like "Your CrumbLabz team will provide the access URL" — use the actual URL. Derive login URLs from the deployment URL and the routes found in the codebase (e.g., if the deployment is at https://example.vercel.app and there's a /admin/login route, the login URL is https://example.vercel.app/admin/login).`;

export async function generateSolutionOverview(
  repoTree: string,
  fileContents: string,
  projectName: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 6000,
    system: SOLUTION_OVERVIEW_PROMPT,
    messages: [
      {
        role: "user",
        content: `Project name: ${projectName}\n\n## Repository File Tree\n\n${repoTree}\n\n## Key File Contents\n\n${fileContents}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

const GETTING_STARTED_PROMPT = `You are a technical writer at CrumbLabz, a company that builds custom software tools for businesses.

You have been given the contents of a GitHub repository — including file tree structure, key file contents, and a Solution Overview document. Your job is to produce a **Getting Started Guide** — an extremely specific, step-by-step guide that tells a non-technical user exactly how to use the solution that was built for them.

IMPORTANT: If the repository contains a getting-started guide, README, setup guide, or quickstart document, treat it as a PRIMARY SOURCE. Extract specific details like URLs, commands, credentials, configuration steps, and feature descriptions from it. Incorporate those exact details into the guide rather than guessing or using generic placeholder text.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then write in clean markdown format:

# Getting Started Guide — [Project Name]

## Welcome
- Brief welcome message (1-2 sentences)
- What this guide covers

## Accessing Your Solution
- Exact URL to access the application (if found in the code, otherwise note "Your CrumbLabz team will provide the access URL")
- Browser recommendations
- Mobile vs desktop experience

## Logging In
- Step-by-step login process
- Where to find the login page
- Default credentials or how to get your first login
- Password reset process (if applicable)

## Your First Time Using [Solution Name]
- What you'll see when you first log in (describe the dashboard/home screen)
- Key navigation elements — what each menu item or tab does
- Walk through the most common task step by step with numbered instructions

## Key Workflows

### [Primary Workflow Name]
1. Step-by-step numbered instructions
2. What to click, what to type, what to expect
3. Include what success looks like at each step

### [Secondary Workflow Name]
1. Same level of detail
2. Be extremely specific about button names, field labels, etc.

(Include as many workflow sections as the codebase reveals)

## Tips & Best Practices
- Common pitfalls and how to avoid them
- Keyboard shortcuts or time-saving features (if any)
- Recommended workflow order

## Getting Help
- How to report issues or request changes
- This is an iterative process — CrumbLabz will continue working with you to refine and improve the solution until it fully meets your needs
- Contact information for support

## What's Next
- Mention that this is a living tool — improvements and new features can be added based on your feedback
- Encourage the client to submit change requests for anything that could work better

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Be EXTREMELY specific. Use actual button names, field labels, and page titles found in the source code. If the code references specific routes (like /dashboard, /settings, /reports), mention them. The reader should be able to follow this guide with zero technical knowledge and successfully use every feature of the application. Think of this as a product manual that a new employee could follow on their first day.

IMPORTANT: If a "Live Deployment URL" is provided in the input, use that exact URL throughout the document. Construct full clickable URLs by combining the deployment URL with routes found in the code (e.g., deployment URL + /admin/login = the login page). Do NOT use placeholder text — use the real URLs. If login routes exist in the code (like /login, /admin/login, /auth), provide the complete URL with the deployment domain.`;

export async function generateGettingStarted(
  repoTree: string,
  fileContents: string,
  solutionOverview: string,
  projectName: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: GETTING_STARTED_PROMPT,
    messages: [
      {
        role: "user",
        content: `Project name: ${projectName}\n\n## Solution Overview\n\n${solutionOverview}\n\n## Repository File Tree\n\n${repoTree}\n\n## Key File Contents\n\n${fileContents}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

const FEATURE_SPECIFICATION_PROMPT = `You are a business analyst and technical lead at CrumbLabz, a company that builds and maintains custom software tools for businesses.

You are given a collection of inputs — which may include meeting minutes, client-submitted feature requests, and/or internal team notes. Your job is to produce a **Feature Specification Document** that defines what needs to be built or changed.

IMPORTANT INPUT PRIORITY: **Feature Requests are the primary source of truth.** They are deliberately written by clients or CrumbLabz professionals and represent specific, intentional asks. **Meeting Minutes are supplementary context only** — they are auto-captured transcripts from Fireflies and may contain generalizations, off-topic discussion, or inaccuracies. Use meeting minutes to fill in background context and details, but always defer to Feature Requests for the actual scope and intent of the change. If meeting minutes contradict a Feature Request, follow the Feature Request.

IMPORTANT: Start the document with this exact branded header (in markdown blockquote format):

> **CrumbLabz** | Custom Software Solutions
> *Turning Business Headaches Into Working Tools*
>
> ---

Then include these sections:

# Feature Specification — [Short Feature Name]

## Request Summary
- One-paragraph summary of what is being requested and why
- Who requested it and through what channel (meeting, portal, etc.)

## Problem Context
- What pain point or gap does this address?
- How does the current system handle this (or fail to)?
- Who is affected?

## Proposed Changes
- Detailed description of what the feature should do
- User-facing behavior (what the user sees and interacts with)
- Include specific UI elements, workflows, or screens if discussed

## Acceptance Criteria
- Numbered list of specific, testable criteria that define "done"
- Each criterion should be verifiable (e.g., "User can export data as CSV from the dashboard")
- Include edge cases if discussed

## Technical Approach
- High-level implementation approach (not full architecture — just enough for a developer to start)
- Key components, APIs, or database changes needed
- Integration points with existing functionality
- Any dependencies or prerequisites

## Estimated Scope
- Small / Medium / Large classification
- Brief rationale for the estimate

## Out of Scope
- Anything explicitly excluded or deferred to a later iteration

End the document with this footer:

---

*Prepared by CrumbLabz | crumblabz.com*
*This document is confidential and intended for the named client only.*

Write clearly for a business audience that may review this document, while including enough technical detail for a developer to implement from it. The document should serve as both a client-facing approval artifact AND a developer-facing implementation guide. Be specific and actionable.`;

export async function generateFeatureSpecification(
  inputs: { type: "meeting_minutes" | "feature_request" | "notes"; title: string; content: string }[]
): Promise<string> {
  // Sort: feature requests first (primary), then notes, then meeting minutes (supplementary)
  const sorted = [...inputs].sort((a, b) => {
    const order = { feature_request: 0, notes: 1, meeting_minutes: 2 };
    return order[a.type] - order[b.type];
  });

  const formattedInputs = sorted
    .map((input, i) => {
      const label =
        input.type === "meeting_minutes"
          ? "Meeting Minutes (supplementary context)"
          : input.type === "feature_request"
            ? "Feature Request (primary)"
            : "Notes";
      return `## Input ${i + 1}: ${label} — ${input.title}\n\n${input.content}`;
    })
    .join("\n\n---\n\n");

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: FEATURE_SPECIFICATION_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here are the inputs to base the feature specification on:\n\n${formattedInputs}`,
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
