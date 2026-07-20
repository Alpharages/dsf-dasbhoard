# DSF Dashboard — Claude Code Guide

## Project Overview

React-based frontend for the **Dark Software Factory (DSF)** — a project manager interface for monitoring AI-powered software development workflows. Features real-time ticket execution tracking, AI code review, quality gate visualization, architecture decision review (ADR), financial analytics, and production error monitoring.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript ~5.9 (strict) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Component Library | shadcn/ui (New York style, Radix UI primitives) |
| Routing | React Router DOM 7 |
| Server State | TanStack React Query 5 |
| Table State | TanStack React Table 8 |
| Forms | React Hook Form 7 + Zod 4 |
| Real-time | Socket.IO Client 4 |
| HTTP Client | Axios |
| Charts | Recharts 3, react-gauge-component, React Flow (@xyflow/react 12) |
| Icons | Lucide React |
| PDF | @react-pdf/renderer 4 |
| Date | date-fns 4, react-datepicker 9, react-day-picker 9 |
| Markdown | react-markdown + react-syntax-highlighter |
| Diffs | react-diff-viewer-continued |
| Notifications | react-hot-toast |
| Testing | Vitest 4 + React Testing Library + jsdom |
| Package Manager | pnpm |

## Common Commands

```bash
pnpm dev          # Start dev server with HMR
pnpm build        # Type-check + production build (tsc -b && vite build)
pnpm lint         # Run ESLint
pnpm test         # Run all tests (vitest run, non-watch)
pnpm exec vitest --watch   # Watch mode
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000   # Backend REST API
VITE_WS_URL=http://localhost:3000         # WebSocket server
```

Access via `import.meta.env.VITE_*`. Auth tokens are stored in localStorage/sessionStorage — no env var needed.

## Project Structure

```
__tests__/                  # Test suite (mirrors src/ structure)
│   └── setup.ts            # jsdom matchMedia polyfill, jest-dom import
src/
├── api/                    # Axios API clients by domain (~22 files)
│   ├── client.ts           # Base Axios instance; Bearer token injection, 401/403 handling
│   ├── authApi.ts
│   ├── executionsApi.ts    # Execution control, logs, activities, QA resolution
│   ├── projectsApi.ts
│   ├── financialApi.ts     # Cost, ROI, budget trends, model efficiency
│   ├── architectureReviewApi.ts
│   ├── capabilitiesApi.ts
│   ├── workloadApi.ts
│   ├── notificationsApi.ts
│   ├── aiRoutingConfigApi.ts
│   ├── connectedAppsApi.ts
│   ├── integrationsApi.ts
│   ├── invitationsApi.ts
│   ├── githubApi.ts
│   ├── decisionApi.ts
│   ├── conversations.ts
│   └── production-errors.ts
├── components/
│   ├── ui/                 # shadcn/ui + Radix primitives
│   ├── auth/               # ProtectedRoute, auth guards
│   ├── layout/             # Header, Sidebar
│   ├── improved/           # ImprovedSidebar (collapsible)
│   ├── dashboard/          # StatsGrid, KpiCard, ListCard, ChartCard
│   ├── notifications/      # NotificationCenter
│   ├── execution/          # ExecutionCard, ExecutionLogsViewer, QAResultsPanel,
│   │                       #   PMResolutionModal, ContainerActivityTimeline,
│   │                       #   ExecutionActionOverlay, ExecutionStatusCard
│   ├── architecture-review/# AdrReviewQueueTable, AdrDetailModal, ConstraintForm,
│   │                       #   DelegateToArchitectModal, TLGuidanceForm,
│   │                       #   RiskAnalysisCard, ConfidenceScoreGauge,
│   │                       #   metrics/ (MetricsSummaryGrid, AiInsightsGallery)
│   ├── financial/          # BudgetGaugeWidget, RoiForecastWidget,
│   │                       #   BudgetScenariosCalculator, MigrationCalculator,
│   │                       #   StoryDrillDownModal, EfficiencyLeaderboard,
│   │                       #   ReportGenerator, FinancialReportDoc,
│   │                       #   TopStoriesList, chart components
│   ├── qa-review/          # QaReviewQueueTable, QaDecisionForm, CodeDiffViewer,
│   │                       #   RequirementContext
│   ├── quality-gate/       # QualityGateSummary, DiffViewer, ApprovalActionForm,
│   │                       #   ReviewModal
│   ├── production-errors/  # ErrorOverviewWidget
│   ├── workload/           # UtilizationGauge
│   ├── invitations/        # CreateInviteModal
│   └── capabilities/       # LimitationFormModal
├── config/
│   └── navigation.ts       # Centralized nav config (routes, roles, icons)
├── contexts/
│   ├── AuthContext.tsx     # User auth state, token management, auto-refresh
│   ├── SocketContext.tsx   # WebSocket connection, real-time event bus
│   └── ThemeContext.tsx    # Dark/light theme
├── features/               # Self-contained feature modules
│   ├── audit-logs/
│   ├── resource-manager/
│   └── …
├── hooks/
│   ├── useSocket.ts
│   ├── useApprovals.ts
│   ├── useAdrQueue.ts
│   ├── useCapabilities.ts
│   ├── useQaReview.ts
│   ├── useProjectUpdates.ts
│   ├── useProductionErrors.ts
│   ├── useProductionErrorSocket.tsx
│   ├── useImportProject.ts
│   ├── useDocumentTitle.ts
│   └── queries/            # TanStack Query hooks
│       ├── useExecutions.ts
│       ├── useNotifications.ts
│       ├── useSystemConfig.ts
│       ├── useAiRoutingConfig.ts
│       ├── useConnectedApps.ts
│       ├── useGithubAccounts.ts
│       ├── useIntegrationHealth.ts
│       └── useProjects.ts
├── lib/
│   └── utils.ts            # cn() (clsx + tailwind-merge), shared formatters
├── pages/
│   ├── Dashboard.tsx               # Main KPI dashboard
│   ├── LoginPage.tsx
│   ├── RegistrationPage.tsx        # Invite-based registration
│   ├── ProfilePage.tsx
│   ├── ForbiddenPage.tsx
│   ├── NotFoundPage.tsx
│   ├── ProjectsSyncPage.tsx
│   ├── DecisionDashboard.tsx
│   ├── ExecutionMonitoringDashboard.tsx  # Real-time AI execution + logs
│   ├── PmApprovalDashboardPage.tsx
│   ├── QaReviewDashboardPage.tsx
│   ├── ArchitectureReviewQueuePage.tsx
│   ├── CapabilityManagementPage.tsx
│   ├── FinancialMetricsPage.tsx
│   ├── CostAnalysisPage.tsx
│   ├── WorkloadCapacityPage.tsx
│   ├── AuditLogsDashboard.tsx
│   ├── ProductionErrorDashboard.tsx
│   ├── NotificationPreferences.tsx
│   ├── InvitationsPage.tsx
│   ├── UsersPage.tsx
│   ├── settings/           # Settings hub (SettingsLayout + sub-pages)
│   ├── architecture-review/# ArchitectureMetricsPage, ConstraintsPage
│   └── observability/      # Observability dashboard
├── styles/
│   ├── theme.css           # CSS custom properties (oklch format)
│   └── animations.css
├── types/                  # Domain TypeScript interfaces
│   ├── index.ts            # Barrel export (DashboardSummary, FinancialSummary, …)
│   ├── auth.ts             # LoginCredentials, LoginResponse
│   ├── user.ts             # User, UserDetail, UsersResponse
│   ├── execution.ts        # Execution, ExecutionStatus, ExecutionLog, QAAttempt
│   ├── project.ts          # Project, ProjectStatus, TicketCounts
│   ├── financial.ts        # StoryCostDto, RoiMetricsDto, BudgetTrendsDto, ModelEfficiencyDto
│   ├── architectureReview.ts   # ADR queue, risk factors, escalation metrics
│   ├── architectureConstraint.ts
│   ├── capabilities.ts
│   ├── qa-review.ts
│   ├── approval.ts
│   ├── conversation.ts     # ConversationStatus, ActionItem
│   ├── notifications.ts
│   ├── invitation.ts
│   ├── integrations.ts
│   └── config.ts
└── utils/
    ├── roleHelpers.ts      # canAccess(), role hierarchy constants
    ├── projectFilters.ts
    ├── projectSort.ts
    └── …
```

## Key Conventions

### Path Alias
Always use `@/` for src-relative imports — never relative paths from `src/`:
```ts
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import type { Execution } from "@/types"
```

### Styling
- Use `cn()` (from `@/lib/utils`) for conditional class merging — never concatenate raw strings.
- Tailwind CSS only — no inline `style` props.
- CSS custom properties for theming via `src/styles/theme.css` (oklch color format).

### Component Patterns
- Functional components with explicit TypeScript `interface` for props.
- shadcn/ui compound pattern: `<Card>`, `<CardHeader>`, `<CardContent>`, etc.
- Data attributes for slot styling: `data-slot="card"`.

### Authentication & Authorization
- `useAuth()` from `AuthContext` — current user, token, login/logout.
- Role hierarchy (highest → lowest): `ADMIN > MANAGER > PM > TL > QA > VIEWER`.
- Use `canAccess(userRole, requiredRole)` from `@/utils/roleHelpers` for hierarchical checks.
- Wrap routes with `<ProtectedRoute requiredRole="...">` for route-level guards.
- Tokens are auto-refreshed inside `client.ts`; no manual handling needed.

### API & Data Fetching
- All HTTP calls go through `src/api/client.ts` (Axios instance with Bearer token + 401/403 interceptors).
- **Never fetch directly in components** — always use a custom hook from `src/hooks/`.
- TanStack React Query for server state (caching, refetching, invalidation).
- Socket.IO real-time updates via `useSocket` hook + `SocketContext`.
- Real-time execution events streamed via WebSocket; `ExecutionLogsViewer` subscribes to live log rooms.

### Forms
- React Hook Form + Zod schema validation via `@hookform/resolvers/zod`.
- Define the Zod schema first, derive the TypeScript type with `z.infer<typeof schema>`.

### TypeScript
- Strict mode is on — no unused locals or parameters.
- All domain types live in `src/types/`; barrel-exported from `src/types/index.ts`.
- Add new domain types to their own file and re-export from `index.ts`.

### Visualization
- Use **Recharts** for line, bar, and pie charts.
- Use **react-gauge-component** for circular gauges (budget, utilization).
- Use **@xyflow/react** (React Flow) + dagre for graph/flow diagrams.
- Use **@react-pdf/renderer** for downloadable PDF reports (see `FinancialReportDoc.tsx`).

### Real-time Architecture
- `SocketContext` manages the Socket.IO connection lifecycle.
- Components call `useSocket()` and subscribe to named events.
- Production errors, execution logs, and audit events all push over WebSocket.

## Feature Areas

| Feature | Pages | Key Components | API file |
|---|---|---|---|
| Execution Monitoring | `ExecutionMonitoringDashboard` | `ExecutionCard`, `ExecutionLogsViewer`, `QAResultsPanel`, `PMResolutionModal` | `executionsApi.ts` |
| Architecture Review | `ArchitectureReviewQueuePage`, `ArchitectureMetricsPage`, `ConstraintsPage` | `AdrReviewQueueTable`, `AdrDetailModal`, `ConstraintForm` | `architectureReviewApi.ts` |
| Financial Analytics | `FinancialMetricsPage`, `CostAnalysisPage` | `BudgetGaugeWidget`, `RoiForecastWidget`, `ReportGenerator` | `financialApi.ts` |
| QA Review | `QaReviewDashboardPage` | `QaReviewQueueTable`, `QaDecisionForm`, `CodeDiffViewer` | (via `executionsApi`) |
| Production Errors | `ProductionErrorDashboard` | `ErrorOverviewWidget` | `production-errors.ts` |
| Capability Mgmt | `CapabilityManagementPage` | `LimitationFormModal` | `capabilitiesApi.ts` |
| User Management | `UsersPage`, `InvitationsPage` | `CreateInviteModal` | `invitationsApi.ts` |
| Workload | `WorkloadCapacityPage` | `UtilizationGauge` | `workloadApi.ts` |
| Settings | `settings/` pages | AI routing panels, general settings | `aiRoutingConfigApi.ts`, `connectedAppsApi.ts` |

## Testing

Tests live in `__tests__/` (root level) mirroring `src/`.

```bash
pnpm test                    # Run all tests once (CI mode)
pnpm exec vitest --watch     # Watch mode during development
```

- Use `vitest` globals (`describe`, `it`, `expect`, `vi`) — no imports needed.
- Use `@testing-library/react` for rendering; prefer `getByRole` / `getByText` queries.
- Use `MemoryRouter` when testing components that use routing hooks.
- Mock contexts with `vi.mock()`.
- The `__tests__/setup.ts` file polyfills `window.matchMedia` and imports `@testing-library/jest-dom`.

### Test File Convention
```
__tests__/components/auth/ProtectedRoute.test.tsx
__tests__/hooks/useApprovals.test.ts
__tests__/utils/roleHelpers.test.ts
__tests__/pages/ExecutionMonitoringDashboard.test.tsx
```

## Linting

ESLint 9 flat config (`eslint.config.js`): TypeScript ESLint recommended + React Hooks + React Refresh. No Prettier.

```bash
pnpm lint
```

## shadcn/ui Components

Config: `components.json` (New York style, Lucide icons, Tailwind CSS).

```bash
pnpm dlx shadcn@latest add <component-name>
```

Output: `src/components/ui/`.

## Deployment

Docker-based deployment available:
- `Dockerfile` — multi-stage build (node build → nginx serve)
- `docker-compose.yml` — local container stack
- `nginx.conf` — SPA routing (all routes fall back to `index.html`)

```bash
docker compose up --build
```

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **dsf-dasbhoard** (2825 symbols, 6522 relationships, 227 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/dsf-dasbhoard/context` | Codebase overview, check index freshness |
| `gitnexus://repo/dsf-dasbhoard/clusters` | All functional areas |
| `gitnexus://repo/dsf-dasbhoard/processes` | All execution flows |
| `gitnexus://repo/dsf-dasbhoard/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
