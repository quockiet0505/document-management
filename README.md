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
│   ├── ai/
│   ├── auth/
│   ├── cache/
│   ├── documents/
│   ├── external/
│   ├── folders/
│   ├── jobs/
│   ├── local-upload/
│   ├── organizations/
│   ├── shared/
│   ├── shares/
│   ├── storage/
│   └── main.ts
│
├── drizzle/
│   ├── schema.ts
│   └── migrations/
│
├── test/
│   ├── integration/
│   ├── unit/
│   └── helpers.ts
│
│── Dockerfile
│── docker-compose.yml
│
├── .env
├── vitest.config.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md

```
---

##  API Endpoints (CORE)
- Below are the main/core API endpoints.
- Additional internal and supporting endpoints exist but are omitted for brevity.

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


### Document Conversion (PDF → DOCX)
- API endpoints are provided for PDF to DOCX conversion.
- Conversion is designed to be executed via a background worker or external service.
- The Encore service acts as an orchestrator and stores conversion results in object storage.
- Current implementation focuses on API design and permission handling.

- **POST** `/v1/documents/:id/convert` - Convert file pdf -> word
- **GET**  `/v1/documents/:id/download-converted` - Download the converted file 

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
4. Update document status -> `ready`

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

## Testing

- Framework: Vitest
- Test types:
  - Unit tests for business logic & permissions
  - Integration tests for API endpoints
- External services (AI, Storage, Jobs) are mocked
- Target coverage: ≥ 80%

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
# run test
bunx vitest run --coverage

# dotenv
# Used for loading environment variables in local development and scripts
bun add dotenv

# PDF text extraction (for document summary)
bun add pdf-parse

# DOCX text extraction
bun add mammoth

# run docker
docker compose up
```
## Running with Docker (Recommended)

This project provides a Docker setup for local development.

### Requirements
- Docker
- Docker Compose

### Notes
- PostgreSQL runs inside Docker
- AWS S3 and Gemini AI are external managed services
- These services are accessed via API keys in `.env` and are not containerized

### Start services
```bash
docker compose up --build
```

## Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
# Auth
AUTH_SECRET=your-super-secret-key

# Storage 
STORAGE_DRIVER=s3 

# Local Storage (if use local)
LOCAL_STORAGE_BASE_URL=http://localhost:4000
LOCAL_STORAGE_PATH=./uploads

# S3 Configuration 
AWS_REGION=your-region                    
AWS_S3_BUCKET=your-bucket       
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Gemini
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=your-gemini-model

# Cache
CACHE_DRIVER=memory

# Database
DBOS_SYSTEM_DATABASE_URL=postgresql://postgres:your-password@localhost:5432/dbos_system

# PDF
CONVERTAPI_SECRET=your-convertapi-secret
```
# How to Get Required API Keys & Credentials

This document contains instructions for obtaining all external API keys
used in this project. Follow only this file to complete the setup.

---

## 1. AWS S3 Credentials

Used for document storage.

### Steps

1. Visit the AWS website  
   https://aws.amazon.com/

2. Sign in to the **AWS Management Console**

3. Open **IAM (Identity and Access Management)**

4. Create a new **IAM User**
   - Enable **Programmatic access**

5. Attach permissions
   - `AmazonS3FullAccess`  
     *(or a restricted custom policy)*

6. After creation, copy:
   - **Access Key ID**
   - **Secret Access Key**

---

## 2. Gemini API Key

Used for AI document summarization.

### Steps

1. Visit **Google AI Studio**  
   https://aistudio.google.com

2. Sign in with your Google account

3. Create a new **API Key**

4. Copy the generated key

---

## 3. ConvertAPI Key (Optional)

Used for PDF → DOCX conversion.

### Steps

1. Visit ConvertAPI  
   https://www.convertapi.com

2. Create a free account

3. Copy the **API Secret** from the dashboard

---

## Notes

- Do not commit API keys to source control.
- Store secrets securely using environment variables or secret managers.
- Rotate keys if they are exposed or compromised.
