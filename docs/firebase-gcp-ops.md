# CrumbLabz — Firebase / GCP Operations

Company-wide reference for how automation authenticates to Firebase across **all**
`crumblabz.com` projects. Individual project repos should link here, not re-document it.

## The principle: one org-level automation identity
- **Service account:** `claude-automation@crumblabz-ops.iam.gserviceaccount.com`
- **Home project:** `crumblabz-ops` — a neutral ops project, *not* a client deliverable.
- **Grant:** `roles/firebase.admin` at the **organization** (`crumblabz.com`, id 671642082298). Org-level IAM **inherits to every project**, so this one SA reaches every current and future Firebase project.
- **Key location (central, outside every repo):** `~/.crumblabz/crumblabz-ops-sa.json` (i.e. `C:\Users\<you>\.crumblabz\...` on Windows). Override with the `CRUMBLABZ_OPS_KEY` env var. Treat it like a root password — never commit it, never put it inside a project repo.

**Onboarding a new project → nothing to do.** The org-level grant already covers it. Point the Admin SDK at the target project id:
```js
initializeApp({ credential: cert(opsKey), projectId: "<the-project>" });
```

### Why not a project's own `firebase-adminsdk` SA?
Each project auto-creates `firebase-adminsdk-fbsvc@<project>…`. Using one project's SA as the org-wide identity is wrong: it's named for/owned by that project, dies if the project is deleted, and conflates "that project's backend identity" with "CrumbLabz automation." Those per-project SAs stay scoped to their own project's runtime.

## What the ops key can and can't do cross-project
- ✅ **Firestore, Cloud Storage, Security Rules** — fully cross-project via the `projectId` option. (Verified: reads/writes/rules-deploy against promondo-sports using the crumblabz-ops key.)
- ⚠️ **Firebase Auth admin (create/list users)** is **project-bound in the Admin SDK** — it targets the *credential's* home project (`crumblabz-ops`), not the `projectId` you pass. To manage a specific project's users, either:
  1. **Manage users in that project's Firebase console** (simplest), or
  2. Call the **Identity Toolkit REST API** with the project in the path (`.../v1/projects/<project>/accounts…`) using the ops token, or
  3. Enable the Identity Toolkit API on `crumblabz-ops` and pass the target `projectId` (quota rides on the ops project).

## Org policy posture (set once, org admin)
- `iam.disableServiceAccountKeyCreation` → **relaxed** at the org so automation SAs can have keys.
- `iam.allowedPolicyMemberDomains` (domain-restricted sharing) → **kept enforced**. Don't admit personal Gmails; give collaborators `@crumblabz.com` identities or use the automation SA.
- Workspace **Super Admin ≠ Cloud IAM** — admins must be granted **Organization Administrator** / **Organization Policy Administrator** in Cloud IAM to manage the org.

## Key hygiene / future
- Rotate the key if ever exposed. Keep it only in `~/.crumblabz/`.
- Tighten later by grouping client projects under a **folder** and granting at the folder instead of the whole org.
- Keyless-purist option for CI: **Workload Identity Federation** (short-lived tokens, no downloadable key) — graduate to it when automation runs in a pipeline.

## Per-project SA keys
Client-project adminsdk keys are **redundant** once the ops key exists — retire them (delete the local file; delete/disable the key in the project console).

---
*Consumed by project repos via a one-line pointer (e.g. `promondo-sports/app/ARCHITECTURE.md`). Tooling that reads the central key: see any CrumbLabz project's `scripts/_ops.mjs`.*
