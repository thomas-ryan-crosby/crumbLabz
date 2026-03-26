# CrumbLabz Developer Onboarding Guide

Welcome to the team! This guide walks you through everything you need to make code changes to our projects using **VS Code** and **Claude Code**.

---

## Part 1: Setup

### Install the Tools

1. **VS Code** - Download and install from [code.visualstudio.com](https://code.visualstudio.com/)
2. **Git** - Download and install from [git-scm.com](https://git-scm.com/downloads)
   - During installation, select "Use Git from the Windows Command Prompt"
   - Select VS Code as the default editor when prompted
3. **Node.js** - Download the LTS version from [nodejs.org](https://nodejs.org/) (needed for our web projects)
4. **Claude Code VS Code Extension** - In VS Code, go to the Extensions tab (Ctrl+Shift+X), search "Claude Code", and install it

### Configure Git (One-Time Setup)

Open a terminal in VS Code (Ctrl+`) and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Clone a Repository

To get a copy of a project on your computer:

1. Open VS Code
2. Press `Ctrl+Shift+P` to open the Command Palette
3. Type "Git: Clone" and select it
4. Paste the GitHub repository URL (e.g., `https://github.com/crumblabz/project-name`)
5. Choose a folder on your computer to save it
6. Click "Open" when prompted

---

## Part 2: Understanding the Basics

### What is Git?

Git tracks every change made to a project. Think of it like "Track Changes" in Microsoft Word, but for code. Key concepts:

- **Repository (repo)** - A project folder tracked by Git
- **Commit** - A saved snapshot of your changes (like a save point in a video game)
- **Branch** - A separate copy of the code where you can make changes without affecting the main version
- **Main branch** - The "official" version of the code that is live or ready to go live
- **Pull Request (PR)** - A request to merge your branch's changes into the main branch so others can review it first

### What is Claude Code?

Claude Code is an AI assistant built into VS Code that can read, write, and modify code for you. Instead of writing code yourself, you describe what you want in plain English and Claude makes the changes. You review and approve each change before it's applied.

---

## Part 3: Making Changes (Step-by-Step Workflow)

Every time you want to make a change, follow these steps:

### Step 1: Pull the Latest Code

Before starting any work, make sure you have the most recent version:

1. Open the project in VS Code
2. Open the terminal (Ctrl+`)
3. Run:

```bash
git pull
```

This downloads any changes other team members have made.

### Step 2: Create a New Branch

Never make changes directly on `main`. Always create a branch:

```bash
git checkout -b your-branch-name
```

Name your branch something descriptive, like:
- `fix-login-button`
- `add-contact-form`
- `update-pricing-page`

### Step 3: Make Your Changes with Claude Code

1. Open the Claude Code panel in VS Code (look for the Claude icon in the sidebar, or press `Ctrl+Shift+P` and search "Claude")
2. Describe what you want to change in plain English. Be specific. Examples:
   - "In the contact page, change the phone number from 555-1234 to 555-5678"
   - "Add a new section to the homepage that says 'Our Services' with three bullet points: Web Design, Branding, Marketing"
   - "Fix the bug where the navigation menu doesn't close on mobile"
3. Claude will show you the proposed changes - **read them carefully**
4. Approve or reject each change
5. Repeat until you're satisfied

**Tips for talking to Claude Code:**
- Be specific about *which file* or *which page* you want changed
- If you don't know the file, ask Claude: "Where is the code for the pricing page?"
- If something looks wrong, tell Claude: "That's not right, I wanted X instead"
- You can ask Claude to explain code: "What does this function do?"

### Step 4: Test Your Changes

Before committing, verify your changes work:

- For websites: Run the dev server (usually `npm run dev`) and check in your browser
- Ask Claude: "How do I run this project locally?" if you're unsure

### Step 5: Commit Your Changes

Once you're happy with the changes, save them to Git:

1. Tell Claude: "Please commit these changes" and describe what you did
2. Or do it manually:

```bash
git add .
git commit -m "Brief description of what you changed"
```

Write commit messages that explain *what* and *why*:
- Good: "Fix mobile nav menu not closing when link is clicked"
- Bad: "Fixed stuff"

### Step 6: Push Your Branch

Upload your branch to GitHub:

```bash
git push -u origin your-branch-name
```

### Step 7: Create a Pull Request

1. Tell Claude: "Create a pull request for this branch"
2. Or go to GitHub in your browser - it will prompt you to create a PR
3. Add a description of what you changed and why
4. Request a review from a team member

### Step 8: After Your PR is Approved

Once approved, the PR will be merged into `main`. Then clean up:

```bash
git checkout main
git pull
git branch -d your-branch-name
```

---

## Part 4: Common Scenarios

### "I made a mistake and want to undo"

- **Haven't committed yet?** Ask Claude: "Undo the changes to [filename]" or run `git checkout -- filename`
- **Already committed but not pushed?** Ask Claude for help reverting
- **Already pushed?** Don't panic - ask a team member for help

### "Someone else changed the same file"

This is called a **merge conflict**. Ask Claude: "Help me resolve the merge conflicts in this file." It will walk you through it.

### "I'm not sure what changed"

Run `git status` to see modified files, or `git diff` to see the actual changes. You can also ask Claude: "What files have I changed?"

### "I need to switch to a different task"

Commit or stash your current work first:

```bash
git stash
git checkout main
git checkout -b new-task-branch
```

To come back later:

```bash
git checkout your-original-branch
git stash pop
```

---

## Part 5: Rules to Follow

1. **Never push directly to `main`** - Always use a branch and PR
2. **Pull before you start working** - Avoid conflicts by starting with the latest code
3. **Commit often** - Small, frequent commits are better than one massive one
4. **Write clear commit messages** - Your future self will thank you
5. **Review Claude's changes before approving** - Don't blindly accept; read what's being changed
6. **Ask if you're unsure** - It's always better to ask than to break something
7. **Don't delete files or folders unless you're sure** - Ask first

---

## Part 6: Learning Resources

Work through these in order. Each builds on the previous. **The most important sections are the first and the last** — Git is your daily tool, and software design thinking is what separates good decisions from bad ones. Claude Code can write the code, but *you* decide what gets built and how it's structured.

### Week 1: Git and the Command Line

- [Git Explained in 100 Seconds](https://www.youtube.com/watch?v=hwP7WQkmECE) (2 min) - Quick overview
- [Git It? How to use Git and Github](https://www.youtube.com/watch?v=HkdAHXoRtos) (30 min) - Beginner-friendly walkthrough
- [Learn Git Branching](https://learngitbranching.js.org/) (interactive) - Practice branching in your browser

### Week 2: How Websites Work (Skim-Level)

You don't need to master writing HTML/CSS/JS by hand — Claude Code handles that. But you should understand what these technologies *are* so you can have informed conversations about them.

- [How The Web Works](https://www.youtube.com/watch?v=hJHvdBlSxug) (12 min) - Basics of web requests
- [HTML in 100 Seconds](https://www.youtube.com/watch?v=ok-plXXHlWw) (2 min)
- [CSS in 100 Seconds](https://www.youtube.com/watch?v=OEV8gMkCHXQ) (2 min)
- [JavaScript in 100 Seconds](https://www.youtube.com/watch?v=DHjqpvDnNGE) (2 min)
- [React in 100 Seconds](https://www.youtube.com/watch?v=Tn6-PIqc4UM) (2 min) - Our projects use React
- [Next.js in 100 Seconds](https://www.youtube.com/watch?v=Sklc_fQBmcs) (2 min) - Our framework built on React
- [APIs Explained](https://www.youtube.com/watch?v=GZvSYJDk-us) (3 min) - How apps talk to each other
- [Databases in 100 Seconds](https://www.youtube.com/watch?v=Cz3WcZLRaWc) (2 min) - Where data lives

### Week 3-4: Software Design and Architecture (Most Important)

This is the highest-value knowledge you can build. Claude Code can write any code you ask for, but it can't decide *what the right thing to build is* or *how it should be organized*. That's your job. These resources teach you how to think about software at a high level.

#### Start Here: How to Think About Building Software

- [How to Think Like a Programmer](https://www.youtube.com/watch?v=azcrPFhaY9k) (14 min) - Problem-solving mindset before touching code
- [Software Design in 7 Minutes](https://www.youtube.com/watch?v=FLtqAi7WNBY) (7 min) - Why structure matters
- [How to Design Software Architecture](https://www.youtube.com/watch?v=BrT3AO8bVQY) (15 min) - High-level overview of architecture thinking
- [Fireship: 10 Design Patterns Explained](https://www.youtube.com/watch?v=tv-_1er1mWI) (12 min) - Common patterns you'll see everywhere

#### How to Choose the Right Approach

- [Monolith vs Microservices](https://www.youtube.com/watch?v=NdeTGlZ__Do) (5 min) - When to keep things simple vs split them up
- [Client-Side vs Server-Side Rendering](https://www.youtube.com/watch?v=f1rF9YKm1Ms) (7 min) - Where should code run? (Directly relevant to our Next.js projects)
- [REST API Explained](https://www.youtube.com/watch?v=-MTSQjw5DrM) (8 min) - How to design how your frontend talks to your backend
- [SQL vs NoSQL](https://www.youtube.com/watch?v=Q5aTUc7c4jg) (6 min) - Choosing the right database type (we use Firebase/NoSQL)
- [When to Use a Database vs File Storage vs Cache](https://www.youtube.com/watch?v=W2Z7fbCLSTw) (10 min) - Where should data live?

#### Thinking About Users and Product

- [How to Write User Stories](https://www.youtube.com/watch?v=Fw98L-kcRpc) (8 min) - Translate what users need into what you build
- [MVP: Minimum Viable Product](https://www.youtube.com/watch?v=1hHMwLxN6EM) (5 min) - Build the smallest useful thing first
- [Technical Debt Explained](https://www.youtube.com/watch?v=J1lnp-nU4wM) (8 min) - Why shortcuts now cost more later

#### Code Organization and Quality

- [Clean Code - Uncle Bob (Lesson 1)](https://www.youtube.com/watch?v=7EmboKQH8lM) (2 hrs) - The gold standard talk on writing maintainable code. Watch even if you're not writing code yourself — it teaches you how to *evaluate* what Claude Code produces
- [SOLID Principles in 100 Seconds](https://www.youtube.com/watch?v=q1qKv5TBaOA) (2 min) - Five rules for well-structured code
- [DRY, KISS, YAGNI](https://www.youtube.com/watch?v=dGBOsb7JHXQ) (5 min) - Three principles: Don't Repeat Yourself, Keep It Simple, You Aren't Gonna Need It
- [Separation of Concerns](https://www.youtube.com/watch?v=0ZNIQOO2sfA) (6 min) - Keep different responsibilities in different places

#### Security and Deployment Basics

- [Web Security in 100 Seconds](https://www.youtube.com/watch?v=hBc2x1AU34U) (2 min) - Common vulnerabilities to watch for
- [Environment Variables Explained](https://www.youtube.com/watch?v=2LZHWjQ0DoA) (5 min) - How we keep secrets out of code
- [CI/CD in 100 Seconds](https://www.youtube.com/watch?v=scEDHsr3APg) (2 min) - How code goes from your computer to production
- [DNS and Domains Explained](https://www.youtube.com/watch?v=uvr9lhUGAKw) (6 min) - How website addresses work

### Ongoing: Key Concepts to Internalize

These aren't videos — they're mental models to keep in mind when making decisions:

1. **"What's the simplest thing that could work?"** - Always start here. Don't over-engineer.
2. **Separate what changes from what stays the same** - Put config in config files, not buried in code.
3. **If you're copy-pasting, something's wrong** - Ask Claude to refactor into a reusable piece.
4. **Name things by what they do, not how they do it** - `sendWelcomeEmail` is better than `firebaseFunction3`.
5. **Every decision is a tradeoff** - Faster to build vs easier to maintain, simple vs flexible, etc. There's rarely a "right" answer.
6. **When in doubt, ask Claude to explain the tradeoffs** - Before building something, ask: "What are the pros and cons of approach A vs approach B?"

### Reference Cheat Sheets

- [Git Cheat Sheet (PDF)](https://education.github.com/git-cheat-sheet-education.pdf) - Print this out and keep it handy
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf) - Speed up your workflow

---

## Quick Reference: Essential Commands

| What you want to do | Command |
|---|---|
| Check which branch you're on | `git branch` |
| See what files changed | `git status` |
| Get latest code | `git pull` |
| Create a new branch | `git checkout -b branch-name` |
| Switch to an existing branch | `git checkout branch-name` |
| Stage all changes | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push branch to GitHub | `git push -u origin branch-name` |
| See commit history | `git log --oneline` |
| Run the website locally | `npm run dev` |
| Install project dependencies | `npm install` |

---

*Last updated: March 2026. If anything in this guide is unclear or outdated, ask a team member or ask Claude Code!*
