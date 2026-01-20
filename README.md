#  Document Management System – Backend Intern Project (42Volta)

A full-featured **Document Management System** built with **Encore.dev + TypeScript**, following the **42Volta Backend Intern Training Program** requirements (Week 4 Evaluation).

This project is designed as a **learning & evaluation project**, not connected to the Volta production codebase.

---

##  Tech Stack

### Core
- **Encore.dev** – Type-safe backend framework
- **TypeScript**
- **Bun / Node.js**
- **PostgreSQL**
- **Drizzle ORM**

### Auth & Validation
- **Better Auth** – Session-based authentication
- **bcryptjs**
- **Zod**

### Storage & Cache
- **Local Storage** (dev)
- **AWS S3 / MinIO** (prod)
- **Keyv** (Memory / Redis)

### Background & AI
- **DBOS SDK** – Durable background workflows
- **Google Gemini API** (AI summary)
- **External HTTP API** (text extraction)

### Testing & DevOps
- **Vitest**
- **Docker**
- **Structured logging**

---

## Developing locally

When you have [installed Encore](https://encore.dev/docs/ts/install), you can create a new Encore application and clone this example with this command.

```bash
encore app create my-app-name --example=ts/empty
```

## Running locally
```bash
encore run
```

While `encore run` is running, open <http://localhost:9400/> to view Encore's [local developer dashboard](https://encore.dev/docs/ts/observability/dev-dash).

## Deployment

Deploy your application to a staging environment in Encore's free development cloud:

```bash
git add -A .
git commit -m 'Commit message'
git push encore
```

Then head over to the [Cloud Dashboard](https://app.encore.dev) to monitor your deployment and find your production URL.

From there you can also connect your own AWS or GCP account to use for deployment.

Now off you go into the clouds!

## Testing

```bash
encore test
```

##  Project Structure
```bash
document-management/
├── app/
│ ├── auth/
│ ├── organizations/
│ ├── documents/
│ ├── shares/
│ ├── storage/
│ ├── jobs/
│ ├── ai/
│ ├── shared/
│ └── main.ts
│
├── drizzle/
│ ├── schema.ts
│ └── migrations/
│
├── test/
│ ├── auth.test.ts
│ ├── documents.test.ts
│ ├── share.test.ts
│ └── helpers.ts
│
├── docker/
│ ├── Dockerfile
│ └── docker-compose.yml
│
├── .env
├── .env.example
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md
```
---

##  API Endpoints

###  Documents

- **POST** `/v1/documents` – List documents
- **GET** `/v1/documents/:id` – Get document details
- **POST** `/v1/documents/upload-url` – Get presigned upload URL
- **POST** `/v1/documents/create` – Create document metadata
- **GET** `/v1/documents/:id/download` – Download document (presigned URL)
- **PUT** `/v1/documents/:id` – Update metadata
- **DELETE** `/v1/documents/:id` – Soft delete document
- **POST** `/v1/documents/search` – Search documents
- **GET** `/v1/documents/:id/summary` – AI-generated summary

###  Shares

- **POST** `/v1/documents/:id/share` – Share document
- **DELETE** `/v1/shares/:id` – Revoke share
- **GET** `/v1/shares/my-documents` – Documents shared with me

---

##  Authentication & Authorization

- Session-based authentication
- Organization-based multi-tenancy
- Role-based access control:
  - **admin**
  - **member**
- Additional permissions via document sharing (`view`, `edit`)

---

##  Storage Strategy

### Local Storage (Development)
- Files stored in `/uploads`
- Simple presigned-like URLs

### S3 / MinIO (Production)
- AWS SDK v3
- Presigned upload & download URLs
- Configurable via `.env`

---

##  Background Processing (DBOS)

A **DBOS workflow** processes uploaded documents:

1. Extract text via external API
2. Generate AI summary (Gemini)
3. Save metadata (text + summary)
4. Update document status → `ready`

Workflow execution is **durable & resumable**.

---

##  AI Integration

- Provider: **Google Gemini**
- Purpose: Document summarization
- Fallback/mock supported for testing

---

##  Caching (Keyv)

- **Memory cache** (development)
- **Redis** (production)
- Cached:
  - Document details
  - Document summaries

---

##  Testing

- Framework: **Vitest**
- Covers:
  - Auth
  - Documents
  - Shares
- Target coverage: **≥ 80%**

##  Required Libraries & Installation

```bash
# Core & Database
bun add drizzle-orm pg
bun add -d drizzle-kit

# Authentication & Validation
bun add zod bcryptjs

# Caching
bun add keyv @keyv/redis

# Storage (AWS S3 / MinIO)
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# AI & External APIs
bun add @google/generative-ai
bun add got node-fetch

# Background Workflows
bun add @dbos-inc/dbos-sdk

# Testing & Dev Tools
bun add -d vitest tsx

# Encore secrets
encore secret set AUTH_SECRET --dev
encore secret set AUTH_SECRET --prod
npm install dotenv

# Database migrations
npx drizzle-kit generate

# Testing 
bun add -D vitest

# dotenv
bun add dotenv
```
