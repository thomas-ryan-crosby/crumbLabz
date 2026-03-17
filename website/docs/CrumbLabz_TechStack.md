# Preferred Technology Stack

A complete overview of the primary technologies used by CrumbLabz across all projects.

---

## Frontend Frameworks & Libraries

| Technology | Projects Using It | Use Case |
|---|---|---|
| Vanilla JavaScript | shoa-finances, proppli, maintenance-tracker | Simple dashboards, internal tools, Firebase-heavy apps |
| React + create-react-app | delinquency-reporting, hoa-ammenities | Complex UIs, multi-page apps |
| React + Vite | fringequartelyreporting, funk-brokers | Modern React apps with faster builds |
| Next.js + TypeScript | kellby-realty-website | Marketing sites, SEO-critical pages, server-side rendering |

---

## Backend Architecture

| Technology | Projects | Notes |
|---|---|---|
| Node.js + Express | delinquency-reporting, fringequartelyreporting, hoa-ammenities | REST APIs, business logic |
| PostgreSQL | fringequartelyreporting, hoa-ammenities, funk-brokers (API) | Relational data, structured schemas |
| Firebase (Firestore/Realtime DB) | shoa-finances, proppli, maintenance-tracker, delinquency-reporting | Real-time sync, authentication, file storage |
| Firebase Admin SDK | All Firebase projects | Server-side Firebase operations |
| Serverless (Vercel Functions) | delinquency-reporting, fringequartelyreporting | Deploy without managing servers |

---

## TypeScript vs JavaScript

| Language | Projects |
|---|---|
| TypeScript | kellby-realty-website, hoa-ammenities (backend + frontend) |
| JavaScript | All other projects |

**Pattern:** TypeScript for larger, more complex projects; JavaScript for rapid development and simpler tools.

---

## Key Technologies & Services

### Authentication
- Firebase Authentication (email/password)
- bcrypt/bcryptjs for password hashing
- JWT tokens (hoa-ammenities)
- express-session (fringequartelyreporting)

### Build Tools
- **Vite** (fringequartelyreporting, funk-brokers) — Modern, fast bundler
- **create-react-app** (delinquency-reporting, hoa-ammenities)
- **Next.js** (kellby-realty-website) — Built-in bundling
- **None** (vanilla JS projects) — Direct file serving

### PDF Generation
- **jspdf + jspdf-autotable** (fringequartelyreporting, hoa-ammenities) — Client-side PDF
- **Puppeteer** (fringequartelyreporting server) — HTML to PDF
- **pdf-lib** (fringequartelyreporting)
- **docx** (fringequartelyreporting) — Word document generation

### Styling
- **Tailwind CSS** (kellby-realty-website)
- **Plain CSS** (most projects)

### Database ORMs & Tools
- **Knex.js** (fringequartelyreporting) — SQL query builder + migrations
- **Sequelize** (hoa-ammenities) — TypeScript-friendly ORM
- **Raw pg** (funk-brokers) — Direct queries

### Third-Party Integrations
- **AppFolio API** (fringequartelyreporting, delinquency-reporting)
- **Mapbox GL** (funk-brokers) — Maps
- **Upstash Redis** (funk-brokers) — Caching
- **Vercel Blob** (funk-brokers) — File storage
- **SendGrid** (hoa-ammenities) — Email
- **Resend** (kellby-realty-website) — Email
- **AWS SDK** (fringequartelyreporting) — S3 storage
- **Persona** (funk-brokers) — Identity verification
- **Tesseract.js** (funk-brokers) — OCR

### File Processing
- **multer** — File uploads
- **xlsx** — Excel file parsing
- **csv-parse** — CSV processing
- **archiver** — ZIP file creation

---

## Architecture Patterns by Project Type

### Firebase-First Apps
*shoa-finances, proppli, maintenance-tracker*

```
Static HTML/JS → Firebase SDK → Realtime DB/Firestore
├── Real-time sync, collaborative features
├── Firebase Auth for session management
└── Firebase Storage for files
```

### React + Express + PostgreSQL
*delinquency-reporting, fringequartelyreporting, hoa-ammenities*

```
React Frontend (Vite/CRA) ↔ Express API ↔ PostgreSQL
                           ├── Firebase Auth (optional)
                           ├── Third-party APIs (AppFolio)
                           └── File Storage (S3/R2)
```

### Next.js Full-Stack
*kellby-realty-website*

```
Next.js App Router + TypeScript + Tailwind CSS
├── Serverless API routes
└── Static site generation
```

### Vite + Serverless API
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

- **Pragmatic over trendy** — Use the simplest tool that works
- **Firebase for real-time** — Preferred for collaborative apps
- **PostgreSQL for structured data** — When relational integrity matters
- **Vite over Webpack** — When bundling is needed
- **TypeScript selectively** — For larger codebases, not universally
- **Vercel for hosting** — Serverless deployment, zero DevOps
- **PDF generation in-app** — jspdf for client-side, Puppeteer for server-side
- **AppFolio integrations** — Common across property management projects
- **No heavy frameworks** — Avoid over-engineering

Our stack prioritizes **speed of development**, **minimal infrastructure complexity**, and **cost-effective managed services**.
