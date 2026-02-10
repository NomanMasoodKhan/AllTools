# CyberMart

CyberMart is: A curated marketplace for blue-team, cloud, DevSecOps, compliance, and offensive cybersecurity tools — focused on real-world deployment, not hype.

## Repository Structure

- `docs/`: product strategy, roles, categories, scope, schema, and Codex context.
- `backend/`: Fastify API with PostgreSQL schema and JWT-ready auth plugin.
- `frontend/`: Next.js (App Router) web app for marketplace browsing.

## Quick Start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:4000` with endpoints under `/api/v1`.

### 2) Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1 npm run dev
```

The frontend runs on `http://localhost:3000`.

## Implemented MVP Foundations

- Product vision and scope docs (`docs/*`).
- Backend health check: `GET /api/v1/health`.
- Backend categories listing: `GET /api/v1/categories`.
- Backend tools listing with filters: `GET /api/v1/tools`.
- PostgreSQL schema for users, developer profiles, tools, categories, reviews, and saved tools.
- Next.js homepage hero aligned to product vision and category rendering from API.
