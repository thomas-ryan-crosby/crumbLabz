# Preferred Technology Stack

A complete overview of the primary technologies used by CrumbLabz across all projects.

---

## Core Philosophy

**Firebase/Firestore is the default database and backend platform.** We reach for Firebase first for its speed of development, real-time capabilities, built-in auth, and zero server management. PostgreSQL is used only in legacy projects or when a specific integration demands it — it is not the default choice for new builds.

---

## Frontend Frameworks & Libraries

| Technology | Projects Using It | Use Case |
|---|---|---|
| Next.js + TypeScript | kellby-realty-website, crumblabz CRM | Full-stack apps, marketing sites, SEO-critical pages, server-side rendering |
| React + Vite | fringequartelyreporting, funk-brokers | Modern React apps with faster builds |
| React + create-react-app | delinquency-reporting, hoa-ammenities | Complex UIs, multi-page apps (legacy) |
| Vanilla JavaScript | shoa-finances, proppli, maintenance-tracker | Simple dashboards, internal tools, Firebase-heavy apps |

**Default for new projects:** Next.js + TypeScript + Tailwind CSS

---

## Backend & Database

| Technology | Role | Notes |
|---|---|---|
| **Firebase Firestore** | Primary database | Default for all new projects. NoSQL, real-time sync, subcollections, serverless |
| **Firebase Authentication** | Auth | Email/password, session management. Default auth solution |
| **Firebase Storage** | File storage | PDFs, uploads, images. Default file storage |
| **Firebase Admin SDK** | Server-side operations | Used in API routes for secure Firestore access |
| **Vercel Functions / Next.js API Routes** | Serverless backend | Default hosting and compute layer |
| Node.js + Express | REST APIs | Used in older projects only (delinquency-reporting, fringequartelyreporting, hoa-ammenities) |
| PostgreSQL | Relational database | Legacy only (fringequartelyreporting, hoa-ammenities, funk-brokers). Not the default |

---

## TypeScript vs JavaScript

| Language | Projects |
|---|---|
| TypeScript | kellby-realty-website, crumblabz CRM, hoa-ammenities (backend + frontend) |
| JavaScript | Older/simpler projects |

**Default for new projects:** TypeScript

---

## Key Technologies & Services

### Authentication
- **Firebase Authentication** (default) — email/password
- bcrypt/bcryptjs for password hashing (legacy projects)
- JWT tokens (hoa-ammenities, legacy)
- express-session (fringequartelyreporting, legacy)

### Build Tools & Hosting
- **Vercel** — Default hosting platform. Serverless deployment, zero DevOps
- **Next.js** — Built-in bundling, SSR, API routes
- **Vite** — For non-Next.js React apps

### PDF Generation
- **jspdf + jspdf-autotable** — Client-side PDF generation
- **Puppeteer** — Server-side HTML-to-PDF
- **pdf-lib** — PDF manipulation
- **docx** — Word document generation

### Styling
- **Tailwind CSS** — Default for all new projects
- Plain CSS — Legacy projects only

### Database ORMs & Tools
- **Firebase SDK / Admin SDK** — Default data access layer
- Knex.js (fringequartelyreporting, legacy) — SQL query builder
- Sequelize (hoa-ammenities, legacy) — TypeScript ORM
- Raw pg (funk-brokers, legacy) — Direct SQL queries

### Third-Party Integrations
- **Resend** — Email (default for new projects)
- **Anthropic Claude API** — AI document generation
- **AppFolio API** (fringequartelyreporting, delinquency-reporting)
- **Mapbox GL** (funk-brokers) — Maps
- **Upstash Redis** (funk-brokers) — Caching
- **Vercel Blob** (funk-brokers) — File storage
- **SendGrid** (hoa-ammenities, legacy) — Email
- **AWS SDK** (fringequartelyreporting, legacy) — S3 storage
- **Persona** (funk-brokers) — Identity verification
- **Tesseract.js** (funk-brokers) — OCR

### File Processing
- **multer** — File uploads
- **xlsx** — Excel file parsing
- **csv-parse** — CSV processing
- **archiver** — ZIP file creation

---

## Default Stack for New Projects

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| File Storage | Firebase Storage |
| Email | Resend |
| AI | Anthropic Claude API |
| Hosting | Vercel |
| Version Control | GitHub |

---

## Architecture Patterns by Project Type

### Firebase-First Full-Stack (Default Pattern)
*crumblabz CRM, new client projects*

```
Next.js App Router + TypeScript + Tailwind CSS
├── Vercel Serverless API Routes
├── Firebase Firestore (database)
├── Firebase Auth (authentication)
├── Firebase Storage (files)
└── Resend (email)
```

### Firebase-First Simple Apps
*shoa-finances, proppli, maintenance-tracker*

```
Static HTML/JS → Firebase SDK → Firestore
├── Real-time sync, collaborative features
├── Firebase Auth for session management
└── Firebase Storage for files
```

### React + Express + PostgreSQL (Legacy)
*delinquency-reporting, fringequartelyreporting, hoa-ammenities*

```
React Frontend (Vite/CRA) ↔ Express API ↔ PostgreSQL
                           ├── Firebase Auth (optional)
                           ├── Third-party APIs (AppFolio)
                           └── File Storage (S3/R2)
```

### Vite + Serverless API (Legacy)
*funk-brokers*

```
React + Vite Frontend → Vercel Serverless Functions
                        ├── PostgreSQL
                        ├── Redis (Upstash)
                        ├── Vercel Blob Storage
                        └── External APIs
```

---

## Key Insights — Stack Preferences

- **Firebase/Firestore first** — Default database and backend for all new projects due to speed, familiarity, and real-time capabilities
- **Pragmatic over trendy** — Use the simplest tool that works
- **TypeScript by default** — For all new projects
- **Tailwind CSS by default** — For all new styling
- **Vite over Webpack** — When bundling is needed outside Next.js
- **Vercel for hosting** — Serverless deployment, zero DevOps
- **PDF generation in-app** — jspdf for client-side, Puppeteer for server-side
- **No heavy frameworks** — Avoid over-engineering
- **PostgreSQL only when required** — Not the default; used in legacy projects or when specific integrations demand it

Our stack prioritizes **speed of development**, **minimal infrastructure complexity**, and **cost-effective managed services**.
