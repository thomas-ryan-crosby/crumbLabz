# Call Script: MVP Presentation & Handoff
Version 1.0

## Purpose

This is the meeting where you demo the working MVP to the client. The goal is to show them a functioning solution, gather feedback, confirm acceptance, and formalize the business agreement.

**Duration:** 30–60 minutes
**Platform:** Google Meet (Fireflies recording active)
**Attendees:** CrumbLabz lead + client stakeholder(s) + end users (if applicable)

---

## Before the Call

- [ ] Complete final QA on the MVP — test every feature, fix any bugs
- [ ] Prepare a staging/demo environment the client can access
- [ ] Create a test account or sample data if the tool requires login
- [ ] Prepare the demo script — know the exact flow you'll walk through
- [ ] Have the Solution One-Pager open for reference (to map features back to requirements)
- [ ] Prepare the invoice in Stripe or Square (don't send yet — just have it ready)
- [ ] Name the calendar event: `[CompanyName] MVP Presentation`
- [ ] Test screenshare, audio, and any live demo links beforehand

---

## Call Structure

### 1. Opening (2–3 minutes)

**Set expectations and build excitement.**

> "Hey [First Name], exciting day — I've got the working version ready to show you. Here's how I'd like to run this:"

> "First, I'll walk you through the tool end-to-end, showing you how it handles the key workflows we agreed on. Then I'll hand it over to you and let you click around. After that, we'll talk about any tweaks, and then we can discuss next steps to get this live."

> "Sound good? And just confirming — Fireflies is recording so we capture any feedback."

### 2. Context Reset (2 minutes)

**Briefly reconnect the demo to the original problem. This frames everything that follows.**

> "Just to set the stage — when we first talked, the core problem was [1-sentence summary from Problem Definition]. The solution we designed was [1-sentence summary from Solution One-Pager]. What I'm about to show you is the working MVP of exactly that."

### 3. Guided Demo (10–15 minutes)

**You drive. Walk through the primary workflow(s) step by step.**

**Structure the demo around user stories, not features:**

> "So let's say it's Monday morning and [user persona] needs to [primary task]. Here's what they'd do..."

**For each workflow:**

1. Show the starting point (where the user begins)
2. Walk through each step at a natural pace
3. Highlight how it solves the specific pain point from discovery
4. Point out any automation or time-saving compared to the old process

**Key phrases during the demo:**

- "Remember how you mentioned [pain point]? This is how we handle that."
- "This used to be a manual step — now it happens automatically."
- "This is where [team member type] would spend most of their time in the tool."
- "Notice how [data/info] is already here — no manual entry needed."

**Tips:**

- Go slow. What's obvious to you is brand new to them.
- Pause after each major feature: "Make sense? Any questions so far?"
- If something isn't perfect, own it: "This is the MVP version — we'll refine [X] based on your feedback."
- Don't show everything. Focus on the 3–5 most impactful features.

### 4. Hands-On Testing (5–10 minutes)

**Let them drive. This is where real feedback emerges.**

> "Okay, I'm going to give you control. Here's the URL — go ahead and poke around. Try to do [primary task] yourself. I'll be right here if you get stuck."

**While they explore:**

- Stay quiet. Let them discover the interface naturally.
- Note where they hesitate, click the wrong thing, or ask questions — these are UX signals.
- If they struggle, guide gently: "Try clicking [X] — that'll take you to [Y]."
- If they find a bug, stay calm: "Good catch — I'll fix that. Won't take long."

**After they've explored:**

> "So what's your first impression? Does this feel like it solves the problem?"

### 5. Feedback Collection (5–10 minutes)

**Structured feedback, not open-ended "what do you think."**

> "Let me ask you a few specific questions:"

- "On a scale of 1–10, how well does this solve the core problem we identified?"
- "Is there anything critical that's missing from this version?"
- "Anything in here that you wouldn't actually use?"
- "If your team started using this tomorrow, what would they need help understanding?"
- "What's the one thing that would make this even better?"

**Categorize feedback as you go:**

| Category | Action |
|----------|--------|
| Bug / broken | Fix before launch |
| Missing critical feature | Add before launch (if small) or phase 2 |
| Nice to have | Phase 2 backlog |
| Design/UX tweak | Fix before launch |
| Out of scope | Acknowledge, note for future |

> "Great feedback. Let me summarize what I'm hearing: [list the key items]. I'll address [X and Y] before we go live, and [Z] will go into the next iteration. Does that feel right?"

### 6. Business Discussion (5–10 minutes)

**Only move to this section if the demo went well and the client is positive.**

> "So — I'm glad you're liking what you see. Let me talk through how we move forward."

**Present the engagement model:**

> "Based on what we built and what you need, I'd recommend [Solution Sale / Monthly License]. Here's why:"

**For Solution Sale:**
> "This is a defined tool with a clear scope. I'd propose a one-time project fee of [amount]. That includes the MVP we just looked at, the [X] tweaks we discussed, full documentation, and a two-week support window after delivery. After that, you own it."

**For Monthly License:**
> "Given that this tool is going to evolve — new features, integrations, changing workflows — I'd recommend a monthly license at [amount/month]. That includes hosting, maintenance, bug fixes, and iterative improvements as your needs change. No long-term contract — month-to-month."

**Handle pricing reactions:**

**"That's more than I expected."**
> "I understand. Let me walk through what's included — [itemize]. If we need to adjust scope to fit a budget, I'm open to that. What number were you thinking?"

**"Can I think about it?"**
> "Absolutely. I'll send you everything in writing — the invoice, what's included, and a summary of today's demo. Take whatever time you need."

**"Let's do it."**
> "Great. I'll send the invoice over today via [Stripe/Square]. Once that's set, I'll finalize the tweaks we discussed and we'll get this live within [timeline]."

### 7. Close & Next Steps (3 minutes)

**End with absolute clarity on what happens next.**

> "Here's the plan from here:"

**If they're proceeding:**
1. "I'll send the invoice today."
2. "I'll make the [X] tweaks we discussed — that'll take about [Y days]."
3. "Once that's done, I'll deploy to production and walk you through the handoff."
4. "I'll send you documentation and access credentials."
5. "[For license] I'll check in next month to see how it's going and discuss any improvements."

**If they need time:**
1. "I'll send you a summary of today's demo and the feedback we captured."
2. "I'll include the pricing details in writing."
3. "Let's reconnect [specific date] to discuss. I'll send a calendar invite."

> "Thanks for your time today, [First Name]. I'm really excited about this tool — I think it's going to make a real difference for your team."

---

## After the Call

- [ ] Update the pipeline stage to **MVP Presentation**
- [ ] Add detailed notes about feedback, reactions, and any pricing discussion
- [ ] Log all feedback items with priority (fix now vs phase 2)
- [ ] Address critical fixes and UX tweaks
- [ ] Send follow-up email within 4 hours with:
  - Demo recording link (from Fireflies)
  - Access URL and credentials for the staging environment
  - Summary of agreed changes
  - Invoice (if accepted) or pricing details (if pending)
- [ ] If accepted: send invoice via Stripe/Square, advance pipeline to **Active Client**
- [ ] If pending: set a follow-up reminder in CRM, advance pipeline to **MVP Presentation**
- [ ] Begin preparing handoff documentation

---

## Demo Best Practices

- **Tell a story, don't list features.** "Here's what Maria does Monday morning" is better than "Here's the dashboard page."
- **Start with the biggest win.** Show the feature that saves the most time first. Lead with impact.
- **Compare to the old way.** "This used to take 45 minutes. Now it's three clicks." Make the improvement visceral.
- **Handle bugs gracefully.** They happen. "That's a bug — I'll fix it today" is professional. Panicking is not.
- **Don't apologize for MVP.** It's an MVP — it's supposed to be focused. "This is the foundation we build on" is the right framing.
- **Read the room.** If they're excited, lean in. If they're hesitant, slow down and ask what's on their mind.
- **The demo is not the pitch.** The tool should speak for itself. Your job is to connect what they see to what they told you they needed.

---

## Handoff Checklist (Post-Acceptance)

For Solution Sale clients:
- [ ] Deploy to production environment
- [ ] Create client accounts and set permissions
- [ ] Write user documentation / quick-start guide
- [ ] Record a short walkthrough video (optional but high-value)
- [ ] Send handoff email with all access details
- [ ] Schedule 1-week check-in during support window
- [ ] Schedule end-of-support-window check-in

For Monthly License clients:
- [ ] Deploy to production environment
- [ ] Create client accounts and set permissions
- [ ] Set up monitoring and error alerting
- [ ] Configure recurring billing in Stripe/Square
- [ ] Send welcome email with access details and support contact
- [ ] Schedule first monthly check-in (30 days out)
