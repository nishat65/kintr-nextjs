# Kintr

A goal-tracking and collaboration platform built with Next.js and Supabase. Set personal goals by day, month, or year, share them publicly, collaborate in team workspaces, and stay in sync through real-time notifications and chat.

## Features

- **Goal management** — Create, track, and filter goals by scope (day / month / year), status, and visibility
- **Workspaces** — Invite collaborators to shared spaces; manage goals on a Kanban board or Gantt timeline
- **Connections** — Send and accept connection requests; auto-connect when collaborating on a workspace
- **Real-time chat** — Direct messages between connections and goal-scoped chat threads
- **Notifications** — In-app notifications for upvotes, comments, mentions, connection requests, status changes, and more; mark as read, star, or delete individually or all at once
- **Explore** — Browse public goals; borrow a public goal into your own workspace with attribution
- **PWA** — Installable, offline shell via native Next.js manifest + service worker
- **Dark / light / system theme** — Flicker-free via `next-themes` + MUI

## Tech Stack

| Layer         | Choice                                       |
| ------------- | -------------------------------------------- |
| Framework     | Next.js 15 (App Router, TypeScript)          |
| UI            | MUI v7 + Emotion                             |
| Icons         | Lucide React + MUI Icons                     |
| Animation     | Motion (Framer Motion v12)                   |
| Forms         | React Hook Form + Zod                        |
| Data fetching | TanStack Query v5                            |
| State         | Zustand                                      |
| Dates         | Day.js                                       |
| Backend       | Supabase (Postgres, Auth, Realtime, Storage) |
| Drag and drop | @dnd-kit/core                                |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd goal-tracker
   npm install
   ```

2. Copy the example env file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and set:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Find these in your Supabase dashboard under **Settings → API**.

3. Run the SQL migrations in order via the Supabase SQL editor:

   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_...
   ...
   supabase/migrations/010_workspace_goal_update_and_notification_rls.sql
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

**PROD URL** - https://kintr-goal-tracker.netlify.app/

## Environment Variables

| Variable                        | Required        | Description                             |
| ------------------------------- | --------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes             | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes             | Supabase anonymous (public) key         |
| `DB_NAME`                       | Migrations only | Database name for direct connection     |
| `DB_PASSWORD`                   | Migrations only | Database password for direct connection |

Never commit `.env.local` or any file containing real credentials. The `.env.example` file is the only env file tracked in git.

## Project Structure

```
src/
  app/               # Next.js App Router pages
  components/        # UI components (goals, chat, notifications, collaboration)
  hooks/             # Custom React hooks
  lib/
    supabase/        # Supabase client + query functions
    query/           # TanStack Query client config
  stores/            # Zustand stores
  types/             # TypeScript interfaces
  styles/            # MUI theme tokens + ThemeRegistry
supabase/
  migrations/        # SQL migrations — run in order
  functions/         # Supabase Edge Functions
public/
  icons/             # PWA icons
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript type check
npm run lint         # ESLint
npm test             # Run tests
```

## License

MIT
