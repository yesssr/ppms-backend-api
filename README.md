# LEXA SH-02 Project Management System API

Backend API for **LEXA SH-02**, a project management system built to support project, task, team, client, and internal operations.

This repository contains the backend implementation developed during my Backend Developer internship at LEXA Tech.

## Overview

The API provides backend services for managing projects and their workflows, including task assignment, progress tracking, team management, and document handling.

### Main capabilities

- **Project management** — create, view, update, and manage project records.
- **Task management** — organize tasks and track work assigned to team members.
- **Progress tracking** — update project progress and maintain a progress log.
- **Public project tracking** — allow clients to check project status using a unique tracking code.
- **Team and department management** — organize internal users, teams, and departments.
- **Client management** — maintain client records associated with projects.
- **Document management** — register documents, upload files to object storage, and generate temporary download URLs.
- **Authentication and authorization** — session-based authentication with role-aware access control.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **Web framework:** Elysia
- **Database:** PostgreSQL
- **Database toolkit:** Drizzle ORM
- **Authentication:** Better Auth
- **Object storage:** S3-compatible storage
- **API documentation:** OpenAPI
- **Testing:** Bun test

## Architecture

The codebase is organized by feature modules. Most modules separate route definitions, controllers, services, schemas, and validation.

```text
src/
├── config/
├── constant/
├── db/
│   ├── migrations/
│   ├── index.ts
│   ├── reset.ts
│   └── seed.ts
├── docs/
└── modules/
    ├── auth/
    ├── case-studies/
    ├── clients/
    ├── dashboard/
    ├── departements/
    ├── documents/
    ├── projects/
    ├── services/
    ├── tasks/
    ├── teams/
    ├── technology/
    ├── testimonials/
    └── users/
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- PostgreSQL
- Access to an S3-compatible object storage service

### Installation

```bash
git clone https://github.com/yesssr/ppms-backend-api.git
cd ppms-backend-api
bun install
```

### Environment variables

Create a `.env` file in the project root.

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Runtime environment |
| `PORT` | API port; defaults to `8080` |
| `FRONTEND_URL` | Allowed frontend origin |
| `BACKEND_URL` | Backend base URL |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth |
| `AWS_ACCESS_KEY_ID` | Object storage access key |
| `AWS_SECRET_ACCESS_KEY` | Object storage secret |
| `AWS_REGION` | Object storage region |
| `AWS_BUCKET_NAME` | Object storage bucket |
| `AWS_ENDPOINT_URL_S3` | S3 API endpoint |
| `AWS_ENDPOINT_URL_IAM` | IAM endpoint |
| `PUBLIC_URL` | Public base URL for stored files |

Use your own development credentials. Never commit real secrets or production environment files.

### Database

The project uses Drizzle ORM and stores migration files in `src/db/migrations`.

Apply the existing migrations:

```bash
bunx drizzle-kit migrate
```

Populate the database with seed data:

```bash
bun run seed
```

> **Warning:** `bun run db:reset` truncates data from tables in the public schema before running the seed. Do not run it against a database containing data you need.

### Run the API

Development mode:

```bash
bun run dev
```

Production-style start:

```bash
bun run start
```

The API uses port `8080` by default.

## API Documentation

OpenAPI documentation is served by the application under:

```text
/openapi
```

Health check:

```http
GET /health
```

The API routes are grouped by resource, including `/api/projects`, `/api/tasks`, `/api/teams`, `/api/clients`, `/api/users`, and `/api/documents`.

Most application routes require an authenticated session. Access is additionally restricted by role. The public project tracking endpoint is:

```http
GET /api/projects/track/:code
```

Refer to the generated OpenAPI documentation for request schemas, response formats, and the complete endpoint list.

## Tests

Run the test suite with:

```bash
bun test
```

## Notes

This repository represents the backend portion of the project. Frontend applications are maintained separately.
