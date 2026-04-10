# taskflow-Aryan-Jagadale

# 1. Overview

TaskFlow is a React + TypeScript project management app with:

- JWT-style authentication flow (mocked)
- Protected routes
- Project CRUD
- Kanban task management with drag-and-drop
- Task filtering by status
- Pagination for project listing
- Theme persistence

The frontend uses MSW (Mock Service Worker), so no separate backend is required for local development.

# 2. Architecture Decisions

1. React + Vite + TypeScript
- Fast local iteration and typed UI/domain models.

2. TanStack Query for server state
- Centralized data-fetching, cache invalidation, and async state handling.

3. MSW for API simulation
- Browser-level interception against `http://localhost:4000` endpoints.
- Keeps frontend/backend contract realistic while backend is unavailable.

4. Auth state in localStorage
- Token and user persisted under `taskflow_token` and `taskflow_user`.
- Auth context rehydrates on refresh and syncs state across tabs.

5. Route protection
- Protected routes enforce auth before accessing `/projects` and `/projects/:id`.
- Root/login/register redirect logic improves UX for logged-in users.

6. Dockerized frontend runtime
- Multi-stage Dockerfile builds static assets in Node stage.
- Minimal Nginx runtime serves built files and supports SPA routing.

# 3. Running Locally

## Option A: Run with Node + Vite (recommended for active development)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open app:

`http://localhost:5173`

## Option B: Run with Docker Compose (containerized runtime)

1. From repo root:

```bash
docker compose up --build
```

2. Open app:

`http://localhost:8080`

3. Stop containers:

```bash
docker compose down
```

## Optional checks

From `frontend`:

```bash
npm run test
npm run lint
npm run build
```

# 4. Test Credentials

Use these credentials for login:

- Email: `test@example.com`
- Password: `password123`

You can also create a new user from the Register screen.

# 5. API Reference

Base URL used by frontend clients:

`http://localhost:4000`

All endpoints below are mocked in the frontend via MSW.

## Auth

### POST `/auth/register`

Request body:

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "password123"
}
```

Response:

```json
{
	"token": "mock.<payload>.sig",
	"user": {
		"id": "u101",
		"name": "John Doe",
		"email": "john@example.com"
	}
}
```

### POST `/auth/login`

Request body:

```json
{
	"email": "test@example.com",
	"password": "password123"
}
```

Response: same shape as register.

## Projects (Authorization: Bearer <token> required)

### GET `/projects?page=1&limit=10`

Response:

```json
{
	"data": [],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 0,
		"totalPages": 1
	}
}
```

### POST `/projects`

Request body:

```json
{
	"name": "Project A",
	"description": "Optional description"
}
```

### GET `/projects/:id`

Returns project by id.

### PATCH `/projects/:id`

Request body supports partial updates:

```json
{
	"name": "Updated Name",
	"description": "Updated description"
}
```

### DELETE `/projects/:id`

Deletes project and associated tasks.

## Tasks (Authorization: Bearer <token> required)

### GET `/tasks?projectId=<id>&status=todo`

- `projectId` optional
- `status` optional (`todo`, `in_progress`, `done`)

Returns filtered list of tasks.

### GET `/projects/:id/tasks`

Returns all tasks for one project.

### POST `/projects/:id/tasks`

Request body:

```json
{
	"title": "Task title",
	"description": "Optional",
	"priority": "low|medium|high",
	"dueDate": "YYYY-MM-DD",
	"assignee": "Name",
	"status": "todo|in_progress|done"
}
```

### PATCH `/tasks/:id`

Partial update of any task fields.

### DELETE `/tasks/:id`

Deletes a task.

# 6. What You'd Do With More Time

1. Real backend integration
- Replace MSW with production API and persistent database.

2. Proper JWT lifecycle
- Add refresh tokens, token expiry handling in auth context, and server-side revocation.

3. Better access control
- Enforce ownership/authorization rules at API layer for projects and tasks.

4. Pagination and filtering enhancements
- Add server-driven sorting, debounced search, and richer filters.

5. Testing depth
- Add unit, integration, and E2E test suites (Playwright/Cypress).

6. CI/CD and quality gates
- Pipeline for lint/test/build, container scan, and automated deploy.

7. Observability
- Client error tracking, performance metrics, and health dashboards.