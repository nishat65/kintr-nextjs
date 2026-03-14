# Project: Kintr

## Overview

A web app built with Next.js and Supabase for setting, tracking, and sharing personal goals
(day / month / year scope) with a social layer: connections, reactions, comments, chat, and notifications.
Phase 3 evolves Kintr into a full goal collaboration platform — think Notion meets Asana,
purpose-built for personal and team goals.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **UI Library:** MUI v7 (@mui/material, @mui/icons-material, @mui/x-date-pickers)
- **Styling:** Emotion (@emotion/react, @emotion/styled) — MUI's styling engine
- **Theme Switching:** next-themes (flicker-free dark/light/system, persisted via cookie)
- **Font:** Montserrat via @fontsource/montserrat
- **Icons:** Lucide React + MUI Icons
- **Animation:** Motion (Framer Motion v12+)
- **Forms:** React Hook Form + @hookform/resolvers + Zod
- **Data Fetching:** TanStack Query (React Query v5) + Axios
- **Date Handling:** Day.js
- **State:** Zustand
- **Loading States:** react-spinners
- **Debouncing:** use-debounce
- **Backend & Auth:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Package Manager:** npm (never use pnpm or yarn)

---

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`
- Always run `npm run typecheck && npm run lint` before committing

---

## Project Structure

```
src/
  app/                        # Next.js App Router pages & layouts
    manifest.ts               # PWA manifest (built-in Next.js, no next-pwa needed)
  components/
    ui/                       # Primitive wrappers (Button, Modal, Input, Spinner)
    goals/                    # GoalCard, GoalForm, GoalList, GoalFilters
    chat/                     # ChatWindow, MessageBubble, DMInbox
    notifications/            # NotificationBell, NotificationList
    connections/              # ConnectionCard, ConnectionRequest
    collaboration/            # WorkspaceCard, KanbanBoard, GoalTimeline (Phase 3)
    layout/                   # AppShell, Sidebar, Topbar, ThemeToggle
  hooks/                      # Custom hooks (prefix: use*)
  lib/
    supabase/                 # client.ts, server.ts, middleware.ts
    axios/                    # axios instance + interceptors
    query/                    # TanStack Query client config
    utils/                    # logger, formatters, helpers
  stores/                     # Zustand stores (goalsStore, authStore, notifStore, themeStore)
  types/                      # Global TS interfaces & enums
  styles/
    theme.ts                  # MUI theme tokens — light + dark palettes defined here
    ThemeRegistry.tsx         # MUI + next-themes bridge (no flicker)
supabase/
  migrations/                 # SQL migrations (never edit manually)
  functions/                  # Edge Functions
public/
  icons/                      # PWA icons (192x192, 512x512, maskable)
  screenshots/                # PWA install screenshots (desktop + mobile)
```

---

## Phase 1 — Frontend (Build This First)

Build all UI with **mocked/static data** before wiring Supabase.

### Design System

- MUI theme defined in `src/styles/theme.ts` — all color, typography, spacing overrides go here
- Font: Montserrat imported in `theme.ts` via `@fontsource/montserrat`
- Use `sx` prop or `styled()` from Emotion for custom styles — never plain CSS files
- Use `motion` for page transitions, list animations, and modal entrances
- Use `lucide-react` for general icons, `@mui/icons-material` for MUI-integrated icons
- Loading states: `react-spinners` (ClipLoader, BeatLoader) inside Suspense boundaries
- Dates: always use `dayjs` — never `new Date()` directly

### Theme Toggle (Dark / Light / System)

- Use `next-themes` for flicker-free SSR-safe theme persistence (stored in cookie, not localStorage)
- Three modes: `light` | `dark` | `system` (follows OS preference)
- `ThemeRegistry.tsx` bridges next-themes → MUI ThemeProvider — this is the ONLY place themes are wired
- `ThemeToggle` component lives in the Topbar — cycles through light → dark → system on click
- Use MUI's `useColorScheme` or `next-themes` `useTheme` hook — never read theme from Zustand
- Implementation pattern:

  ```ts
  // src/styles/ThemeRegistry.tsx
  "use client";
  import { useTheme } from "next-themes";
  import { ThemeProvider, createTheme } from "@mui/material/styles";
  import CssBaseline from "@mui/material/CssBaseline";
  import { getDesignTokens } from "./theme";

  export const ThemeRegistry = ({ children }) => {
    const { resolvedTheme } = useTheme();
    const theme = createTheme(
      getDesignTokens(resolvedTheme === "dark" ? "dark" : "light")
    );
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    );
  };
  ```

- Wrap `layout.tsx` with `<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>`
  then `<ThemeRegistry>` inside it

### Responsive Layout

- Mobile-first — use MUI breakpoints: `xs` (0px), `sm` (600px), `md` (900px), `lg` (1200px)
- Topbar + bottom nav on mobile (`xs`–`sm`); sidebar + topbar on desktop (`md`+)
- Sidebar: collapsible drawer on desktop, full-screen drawer on mobile
- All tables → cards/lists on mobile; all modals → bottom sheets on mobile (`xs`)
- Use MUI `useMediaQuery` or `sx={{ display: { xs: 'none', md: 'flex' } }}` — never custom CSS breakpoints
- Touch targets: minimum 44×44px on all interactive elements
- Test at: 375px (iPhone SE), 768px (tablet), 1280px (desktop)

### Forms

- All forms: React Hook Form + Zod + @hookform/resolvers/zod
- Never use uncontrolled inputs without React Hook Form
  ```ts
  const schema = z.object({ title: z.string().min(1) });
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
  ```

### Data Fetching (Phase 1 — mock data)

- All server state: TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`)
- HTTP client: Axios at `src/lib/axios/client.ts` with base URL + auth interceptor
- Search inputs: `useDebounce(value, 300)` before triggering queries
- Query key convention: `['goals', { scope, date }]`, `['goal', id]`, `['workspace', id]`

### Pages (UI-only first)

| Route                             | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| `/`                               | Landing page — hero, features, CTA             |
| `/login`                          | Auth (email + OAuth)                           |
| `/dashboard`                      | Goal list + scope tabs (day/month/year)        |
| `/goals/new`                      | Goal creation form                             |
| `/goals/[id]`                     | Goal detail, comments, goal chat               |
| `/explore`                        | Public goal feed                               |
| `/profile/[username]`             | Profile + public goals                         |
| `/connections`                    | Connections list + requests                    |
| `/chat`                           | DM inbox                                       |
| `/chat/[userId]`                  | DM thread                                      |
| `/notifications`                  | Notification feed                              |
| `/settings`                       | Profile + theme + account settings             |
| `/workspaces`                     | (Phase 3) All workspaces                       |
| `/workspaces/[id]`                | (Phase 3) Workspace — board/timeline/list view |
| `/workspaces/[id]/goals/[goalId]` | (Phase 3) Collaborative goal detail            |

---

## Phase 2 — Backend (Wire After UI is Approved)

### Supabase Rules

- Enable **RLS on all tables** — no exceptions
- Only use the `anon` key on the frontend — never the `service_role` key
- Enable **Supabase Realtime** on: `messages`, `goal_messages`, `notifications`, `goal_activities`
- Use **Edge Functions** for: notification dispatch, complex permission logic
- Use **Storage** for avatars (bucket: `avatars`, public read)

### Database Schema

**profiles** — extends Supabase Auth

```sql
id, display_name, avatar_url, bio, created_at, updated_at
```

**goals**

```sql
id, user_id (FK→profiles), title, description,
scope: ENUM('day','month','year'),
target_date,        -- day=YYYY-MM-DD | month=YYYY-MM-01 | year=YYYY-01-01
status: ENUM('not_started','in_progress','completed','failed'),
visibility: ENUM('public','private'),
created_at, updated_at
```

**connections** — mutual, both must accept

```sql
id, requester_id (FK→profiles), addressee_id (FK→profiles),
status: ENUM('pending','accepted','rejected','blocked'),
created_at, updated_at
-- UNIQUE(requester_id, addressee_id)
```

**comments** — flat, no threads in v1

```sql
id, goal_id (FK→goals), user_id (FK→profiles), content, created_at
```

**votes** — one per user per goal, switchable

```sql
id, goal_id (FK→goals), user_id (FK→profiles), type: ENUM('upvote','downvote'), created_at
-- UNIQUE(goal_id, user_id) — ON CONFLICT DO UPDATE to switch
```

**messages** — global DM (mutual connections only)

```sql
id, sender_id (FK→profiles), recipient_id (FK→profiles), content, read_at, created_at
```

**goal_messages** — goal-scoped chat

```sql
id, goal_id (FK→goals), sender_id (FK→profiles), content, created_at
```

**notifications**

```sql
id, user_id, actor_id (both FK→profiles),
type: ENUM('upvote','downvote','comment','message','goal_message',
           'connection_request','connection_accepted','goal_shared',
           'workspace_invite','goal_assigned','goal_status_changed','mention'),
entity_type: ENUM('goal','comment','message','connection','workspace'),
entity_id (uuid), read_at, created_at
```

### Permission Matrix

| Action         | Public Goal            | Private Goal               |
| -------------- | ---------------------- | -------------------------- |
| View           | Anyone (logged out OK) | Owner + mutual connections |
| Comment / Vote | Any logged-in user     | Mutual connections only    |
| Edit / Delete  | Owner only             | Owner only                 |

| Chat Type           | Access                  |
| ------------------- | ----------------------- |
| Global DM           | Mutual connections only |
| Goal chat (public)  | Any logged-in user      |
| Goal chat (private) | Mutual connections only |

**Notifications** fire on: upvote, downvote, comment, DM, goal chat, connection request/accept, goal shared, workspace invite, goal assignment, status change, @mention. Never notify yourself.

---

## Phase 3 — Goal Collaboration Platform

Transform Kintr from personal goal tracking into a shared workspace where teams and friend groups
collaborate on goals together — inspired by Notion (flexible docs), Asana (task ownership + timelines),
Linear (status workflows), and Monday (visual boards).

### New Concepts

**Workspace** — a shared space (like a team or project) where members collaborate on goals together.
One user creates it; others are invited. Goals inside a workspace are always visible to all members.

**Collaborative Goal** — a goal inside a workspace. Has an assignee, priority, due date, and status
tracked across a Kanban board and timeline. Any workspace member can update it.

**Mentions** — `@username` in comments, goal descriptions, or goal messages triggers a notification.

**Activity Feed** — every change to a goal (status update, reassignment, comment, edit) is logged
as an activity event and shown in a real-time feed on the goal detail page.

### Phase 3 Database Additions

**workspaces**

```sql
id, name, description, owner_id (FK→profiles),
visibility: ENUM('private','public'),
created_at, updated_at
```

**workspace_members**

```sql
id, workspace_id (FK→workspaces), user_id (FK→profiles),
role: ENUM('owner','admin','member','viewer'),
joined_at
-- UNIQUE(workspace_id, user_id)
```

**workspace_goals** — extends goals for collaboration context

```sql
id, workspace_id (FK→workspaces), goal_id (FK→goals),
assignee_id (FK→profiles, nullable),
priority: ENUM('none','low','medium','high','urgent'),
due_date (date, nullable),
position (float),      -- drag-and-drop ordering within board column
created_at, updated_at
```

**goal_activities** — immutable audit log

```sql
id, goal_id (FK→goals), actor_id (FK→profiles),
type: ENUM('created','status_changed','assigned','unassigned','priority_changed',
           'due_date_set','title_edited','comment_added','attachment_added'),
metadata (jsonb),      -- e.g. { from: 'in_progress', to: 'completed' }
created_at
-- Enable Supabase Realtime on this table
```

**attachments**

```sql
id, goal_id (FK→goals), uploaded_by (FK→profiles),
file_name, file_url (Supabase Storage), file_size, mime_type,
created_at
```

**goal_tags**

```sql
id, workspace_id (FK→workspaces), name, color (hex), created_at
```

**goal_tag_assignments**

```sql
goal_id (FK→goals), tag_id (FK→goal_tags)
-- PK: (goal_id, tag_id)
```

### Phase 3 Features

#### Workspace Management

- Create / edit / delete a workspace
- Invite members by email or username; set role (admin / member / viewer)
- Workspace settings: name, description, visibility (private / public)
- Viewer role: read-only access to all workspace goals and activity

#### Collaborative Goal Views (switchable per workspace)

- **Board view (Kanban):** columns = `not_started | in_progress | completed | failed`; drag cards between columns to update status; `position` float for ordering within column
- **Timeline view (Gantt):** goals plotted on a horizontal date axis by `due_date`; drag to reschedule
- **List view:** flat sortable table — sort by priority, due date, assignee, status
- **My Goals view:** filter workspace goals assigned to the logged-in user

#### Goal Collaboration Features

- Assign a goal to any workspace member (triggers `assigned` notification)
- Set priority: `none | low | medium | high | urgent` (color-coded chips)
- Set due date via MUI DatePicker (stored in `workspace_goals.due_date`)
- Attach files (images, PDFs) — stored in Supabase Storage, linked via `attachments` table
- Tag goals with color-labeled tags scoped to the workspace
- `@mention` any workspace member in comments or descriptions — fires `mention` notification

#### Activity Feed (Real-time)

- Goal detail page shows a live feed of all `goal_activities` for that goal
- Events rendered as human-readable strings: "Ali changed status from In Progress → Completed"
- Subscribe via Supabase Realtime on `goal_activities` filtered by `goal_id`
- Activity is append-only — never edit or delete activity records

#### Workspace Notifications

- `workspace_invite`: user receives invite → accept/reject from `/notifications`
- `goal_assigned`: you are assigned a goal
- `goal_status_changed`: a goal you own or are assigned to changes status
- `mention`: someone @mentions you in a comment or description

### Phase 3 Permission Matrix (Workspace)

| Action                       | Owner | Admin | Member | Viewer |
| ---------------------------- | ----- | ----- | ------ | ------ |
| Edit workspace settings      | ✅    | ✅    | ❌     | ❌     |
| Invite / remove members      | ✅    | ✅    | ❌     | ❌     |
| Create / edit / delete goals | ✅    | ✅    | ✅     | ❌     |
| Assign goals                 | ✅    | ✅    | ✅     | ❌     |
| Comment / attach files       | ✅    | ✅    | ✅     | ❌     |
| View all goals + activity    | ✅    | ✅    | ✅     | ✅     |
| Drag-reorder on board        | ✅    | ✅    | ✅     | ❌     |

### Phase 3 UI Components to Build

- `WorkspaceCard` — workspace thumbnail with member avatars + goal count
- `KanbanBoard` — drag-and-drop columns using `@dnd-kit/core` (install in Phase 3)
- `GoalTimeline` — Gantt-style date chart using `@mui/x-charts` or custom SVG
- `GoalListTable` — MUI DataGrid or custom sortable table
- `ActivityFeedItem` — icon + human-readable event string + timestamp
- `MemberAvatarStack` — overlapping avatars showing workspace members
- `PriorityChip` — color-coded MUI Chip for priority levels
- `TagChip` — color-labeled goal tags
- `AttachmentPreview` — thumbnail for images, icon for PDFs
- `MentionInput` — rich comment input with `@` autocomplete (use `react-mentions` or custom)

---

## PWA Setup (Apply in Phase 3)

Next.js supports PWA natively in the App Router — **do NOT install next-pwa**.

### Required Files

**`src/app/manifest.ts`**

```ts
import { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kintr",
    short_name: "Kintr",
    description: "Track and collaborate on your goals",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6C63FF",
    orientation: "natural",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Kintr Dashboard",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Kintr Mobile",
      },
    ],
  };
}
```

**`public/sw.js`** — minimal service worker for offline shell caching

```js
const CACHE = "kintr-v1";
const OFFLINE_URLS = ["/", "/dashboard", "/offline"];
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)))
);
self.addEventListener("fetch", (e) =>
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
);
```

**Register SW in `src/app/layout.tsx`**

```ts
useEffect(() => {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
}, []);
```

**`/offline` route** — a minimal page shown when the user is offline and cache misses.

### PWA Checklist

- Lighthouse PWA score ≥ 90 before shipping Phase 3
- All icons generated at 192×192, 512×512, and 512×512 maskable
- `theme_color` in manifest matches MUI primary color in `theme.ts`
- HTTPS required in production (Vercel handles this automatically)

---

## Responsiveness Rules (All Phases)

- All layouts: mobile-first with MUI breakpoints — never hard-code pixel widths
- Sidebar navigation: hidden on `xs`/`sm`, persistent on `md`+
- Bottom navigation bar: visible on `xs`/`sm`, hidden on `md`+
- Modals → bottom sheets on `xs` using MUI `SwipeableDrawer`
- Kanban board (Phase 3): horizontal scroll on mobile, full columns on desktop
- Timeline/Gantt (Phase 3): pinch-to-zoom on mobile, scroll on desktop
- Min touch target: 44×44px on all buttons and interactive elements
- Text: never below 14px on mobile; prefer 16px for body copy

---

## Code Conventions

- Named exports only — no default exports except `page.tsx` / `layout.tsx`
- Arrow functions for all components and hooks
- 2-space indentation
- No `console.log` in production — use `src/lib/utils/logger.ts`
- Validate all inputs with Zod before any mutation
- All DB access via Supabase client — no raw SQL in components
- Activity records are append-only — never update or delete `goal_activities`
- Never commit `.env.local` — maintain `.env.example` with placeholder values

---

## v1 Scope (Phases 1 + 2)

✅ Goal CRUD (day/month/year) · ✅ Public/private visibility · ✅ Goal sharing
✅ Mutual connections · ✅ Comments · ✅ Upvote/downvote
✅ Global DM · ✅ Goal chat · ✅ Real-time notifications

## v2 Scope (Phase 3)

✅ Workspaces (team collaboration) · ✅ Kanban board view · ✅ Timeline/Gantt view
✅ Goal assignment + priority + tags · ✅ File attachments · ✅ Activity feed (real-time)
✅ @mentions · ✅ Dark / light / system theme toggle · ✅ Responsive layout
✅ PWA (installable, offline shell)
❌ In-app video calls · ❌ AI goal suggestions · ❌ Billing/plans · ❌ Native mobile app

---

## Phase 4 — Collaborator Notifications, Connections & Bug Fix

### Bug Fix

- **Private workspace RLS error (`42501`):** Fix the RLS policy on the `workspaces` table so that the workspace owner can insert a private workspace. Ensure the `INSERT` policy allows `auth.uid() = owner_id`.

### Notification Additions

Add these notification types to the existing `notifications.type` ENUM:

```
'collaborator_added'        -- collaborator is added to a workspace
'goal_deleted'              -- a goal the collaborator is on is deleted
'goal_moved'                -- a goal is moved to a different workspace
'collaborator_has_goal'     -- workspace owner is warned that a new collaborator already has a goal in this workspace
```

**Rules:**

- When adding a collaborator: notify the **workspace owner** if that user already has a goal in the workspace (`collaborator_has_goal`).
- Notify the **collaborator** when: added to a workspace, any goal update, goal deletion, or goal moved to another workspace.

### Connection System Additions

- **Auto-connect on collaboration:** When a user is added to a workspace as a collaborator, automatically create an `accepted` connection between the workspace owner and the collaborator (skip if one already exists).
- **Global user discovery:** On the `/connections` page, list all app users so any user can send a connection request. Recipients are notified and can accept/reject.
- **Remove connection:** Users can remove a connection. Removing cascades — the removed user is also removed from any shared workspace collaboration lists.

---

## Phase 5 — Cross-User Goal Reuse

Allow user B to add user A's **public** goal into their own workspace Kanban board, with attribution and a notification to the original owner.

### Feature: Borrow a Public Goal

- On the Explore page and public profile pages, each public goal card shows a **"Add to Workspace"** button (visible only to logged-in users who are workspace members).
- Clicking it opens a workspace picker dialog — user selects which workspace to add it to.
- The goal is added to `workspace_goals` with a new `source_user_id` field pointing to the original owner and a `borrowed: true` flag.
- A **"Borrowed from @username"** tag chip is shown on the Kanban card to distinguish it from native workspace goals.
- The original goal owner (user A) receives a notification of type `goal_borrowed` when someone adds their goal.
- User A can see in their goal detail page a list of workspaces that have borrowed this goal.

### Database Additions (Phase 4)

**`workspace_goals` additions:**

```sql
source_user_id UUID REFERENCES profiles(id) NULL,  -- original goal owner if borrowed
borrowed       BOOLEAN NOT NULL DEFAULT FALSE
```

**`notifications.type` addition:**

```
'goal_borrowed'  -- fired when someone adds your public goal to their workspace
```

### Notification Flow

1. User B clicks "Add to Workspace" on user A's public goal.
2. `workspace_goals` row is inserted with `borrowed = true`, `source_user_id = A.id`.
3. A `goal_borrowed` notification is inserted for user A with `entity_id = goal.id` and metadata `{ borrower_id: B.id, workspace_id: ws.id }`.
4. User A sees: _"@userB added your goal '{title}' to their workspace"_ in `/notifications`.

### UI Components to Build (Phase 4)

- `BorrowGoalButton` — shown on GoalCard when `showAuthor && goal.visibility === 'public' && !isOwner`
- `WorkspacePickerDialog` — lists the user's workspaces to select a target
- `BorrowedTag` chip on `GoalKanbanCard` when `wGoal.borrowed === true`
- Borrowed goals list section on goal detail page (`/goals/[id]`)

## Phase 6 - Notification and Chat enable

- Users are notified in real time if they are mentioned in a comment or message
- Users can DM each other in real time in Chat section
- Users should get notification when there is a new connection request
- **For Agent** - Add any more features, if necessary to make it more complete
- Make sure to test them properly as well

## Phase 7 — AI & Advanced Features

- AI goal suggestions based on user history and trends (Claude API integration)
- Smart deadline suggestions using past completion rate data
- In-app video calls for workspace collaboration sessions
- Billing / subscription plans (free tier + pro)
- Native mobile app (React Native or Expo)
