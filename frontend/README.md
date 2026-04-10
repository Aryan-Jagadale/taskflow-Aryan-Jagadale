# TaskFlow — Project Management Tool

> Greening India Assignment — Frontend only

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** — client-side routing
- **TanStack Query** — data fetching, caching & optimistic updates
- **shadcn/ui** + **Tailwind CSS** + **Radix UI** — component library
- **@dnd-kit** — drag-and-drop Kanban board
- **MSW (Mock Service Worker)** — browser-level API mocking
- **react-hook-form** + **zod** — form validation

## Getting Started

```bash
npm install
npm run dev
```

Login: `demo@taskflow.com` / `password123`

## Mock API (MSW)

All API calls target `http://localhost:4000` but are intercepted by MSW in the browser. No backend needed. Data resets on page reload.

## Features

- Auth (login/register) with token-based session
- Dark mode toggle (persisted)
- Projects CRUD
- Kanban board with drag-and-drop
- Task management with optimistic updates
- Responsive design (375px–1280px+)
- Loading skeletons & empty states
