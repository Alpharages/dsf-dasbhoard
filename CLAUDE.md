# DSF Dashboard — Claude Code Guide

## Project Overview

React-based frontend for the **Dark Software Factory (DSF)** — a project manager interface for monitoring AI-powered software development workflows. Features real-time ticket execution tracking, AI code review, quality gate visualization, and production error monitoring.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 (strict) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Component Library | shadcn/ui (New York style, Radix UI primitives) |
| Routing | React Router DOM 7 |
| Server State | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Real-time | Socket.IO Client 4 |
| HTTP Client | Axios |
| Charts | Recharts, react-gauge-component, React Flow (XYFlow) |
| Icons | Lucide React |
| Testing | Vitest 4 + React Testing Library + jsdom |
| Package Manager | pnpm |

## Common Commands

```bash
pnpm dev          # Start dev server with HMR
pnpm build        # Type-check + production build (tsc -b && vite build)
pnpm lint         # Run ESLint
pnpm test         # Run all tests (vitest run, non-watch)
```

## Project Structure

```
__tests__/              # Test files mirroring src structure
├── setup.ts            # jest-dom setup
src/
├── api/                # Axios API clients by domain
│   └── client.ts       # Axios instance with auth interceptors
├── components/
│   ├── ui/             # shadcn/ui + Radix primitives
│   ├── auth/           # ProtectedRoute, auth guards
│   ├── layout/         # Header, navigation
│   ├── improved/       # ImprovedSidebar (collapsible)
│   ├── dashboard/      # Dashboard widgets
│   ├── notifications/  # NotificationCenter
│   └── [feature]/      # Feature-scoped components
├── config/
│   └── navigation.ts   # Centralized nav config
├── contexts/           # AuthContext, ThemeContext, SocketContext
├── features/           # Feature modules (audit-logs, resource-manager, etc.)
├── hooks/              # Custom hooks; api/ and queries/ subfolders for TanStack Query
├── lib/
│   └── utils.ts        # cn() helper (clsx + tailwind-merge), formatters
├── pages/              # Page components (~29 pages)
│   └── settings/       # Settings pages
├── styles/             # theme.css (CSS vars), animations.css
├── types/              # TypeScript type definitions by domain
└── utils/              # roleHelpers, projectFilters, projectSort, etc.
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000   # Backend REST API
VITE_WS_URL=http://localhost:3000         # WebSocket server
```

Access via `import.meta.env.VITE_*`. Auth tokens are stored in localStorage/sessionStorage — no env var needed.

## Key Conventions

### Path Alias
Use `@/` for all src-relative imports:
```ts
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
```

### Styling
- Use `cn()` (from `@/lib/utils`) for conditional class merging — never concatenate raw strings.
- Tailwind CSS only; no inline styles.
- CSS custom properties for theming (oklch format in `src/styles/theme.css`).

### Component Patterns
- Functional components with explicit TypeScript interfaces for props.
- shadcn/ui compound pattern: `<Card>`, `<CardHeader>`, `<CardContent>`, etc.
- Data attributes for slot styling: `data-slot="card"`.

### Authentication & Authorization
- `useAuth()` context hook provides current user and auth methods.
- Role hierarchy (highest to lowest): `ADMIN > MANAGER > PM > TL > QA > VIEWER`.
- Use `canAccess(userRole, requiredRole)` from `@/utils/roleHelpers` for hierarchical checks.
- Wrap routes with `<ProtectedRoute requiredRole="...">` for route-level access control.

### API & Data Fetching
- Axios instance (`src/api/client.ts`) auto-injects Bearer token and handles 401/403.
- Use TanStack React Query via custom hooks in `src/hooks/` — never fetch directly in components.
- Socket.IO real-time updates via `useSocket` hook and `SocketContext`.

### Forms
- React Hook Form + Zod schema validation via `@hookform/resolvers/zod`.

### TypeScript
- Strict mode is on — no unused locals or parameters.
- Domain types live in `src/types/`; barrel-exported from `src/types/index.ts`.

## Testing

Tests live in `__tests__/` (root level) mirroring the `src/` structure.

```bash
pnpm test                    # Run all tests once
pnpm exec vitest --watch     # Watch mode
```

- Use `vitest` globals (`describe`, `it`, `expect`, `vi`) — no imports needed.
- Use `@testing-library/react` for rendering; prefer `getByRole` / `getByText` queries.
- Use `MemoryRouter` (from react-router-dom) when components use routing hooks.
- Mock contexts with `vi.mock()`.

### Test File Convention
```
__tests__/components/auth/ProtectedRoute.test.tsx
__tests__/hooks/useApprovals.test.ts
__tests__/utils/roleHelpers.test.ts
```

## Linting

ESLint 9 with flat config (`eslint.config.js`). Rules: TypeScript ESLint recommended, React Hooks, React Refresh. No Prettier — ESLint only.

```bash
pnpm lint
```

## shadcn/ui Components

Config is in `components.json` (New York style, Lucide icons). Add new components via:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are placed in `src/components/ui/`.
