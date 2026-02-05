# DSF Dashboard - Project Manager Interface

Dark Software Factory (DSF) Dashboard is a React-based frontend for monitoring AI-powered software development workflows.

## Features

- **Real-time Project Monitoring**: WebSocket-powered live updates for ticket execution status
- **Code Review Interface**: Review AI-generated code with quality metrics and confidence scores
- **Quality Gate Visualization**: View linting, testing, and security scan results
- **Approval Workflows**: Approve, reject, or request rework for AI-generated code
- **Production Error Monitoring**: Real-time dashboard for monitoring production errors across all applications (Story 9-UI)

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP requests
- **React Query (TanStack Query)** - Data fetching and caching
- **Recharts** - Data visualization charts
- **@tanstack/react-table** - Table state management

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_WS_URL` | WebSocket server URL | `http://localhost:3000` |

**Example `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

> **Note**: After changing environment variables, you must restart the dev server for changes to take effect.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── dashboard/     # Dashboard-specific components
│   ├── layout/        # Layout components (Sidebar, Header)
│   ├── production-errors/  # Production error monitoring components
│   └── quality-gate/  # Code review & approval components
├── hooks/             # Custom React hooks (WebSocket, data fetching)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## Development

### Linting

```bash
npm run lint
```

### Building

The production build outputs to the `dist/` directory:

```bash
npm run build
```

## Integration with Backend

This dashboard integrates with the Dark Software Factory backend API:

- **REST API**: `/api/v1/pm-dashboard/*` for project and summary data
- **WebSocket**: `/dashboard` namespace for real-time ticket updates
- **Approval API**: `/api/v1/executions/{id}/approve` for code approval actions
- **Production Error API**: `/api/v1/monitoring/errors/*` for production error monitoring

Ensure the backend server is running on the configured `VITE_API_BASE_URL` before starting the dashboard.

## Production Error Monitoring

The Production Error Monitoring Dashboard provides real-time visibility into production errors:

### Features

- **Error Overview Widget**: Key metrics including total active errors, new errors (24h), critical/high counts, and MTTR
- **Error Trend Chart**: 7-day rolling trend visualization by severity level
- **Application Health Heatmap**: Color-coded health status for each monitored application
- **Filterable Error List**: Sortable, paginated table with severity, status, and application filters
- **Error Detail Modal**: Full error context including stack traces, deployment info, related commits, and user context
- **Real-time Notifications**: Socket.IO-powered toast notifications for CRITICAL and HIGH severity errors
- **Bulk Actions**: Create ClickUp tickets, acknowledge errors, or export to CSV for selected errors
- **RBAC Integration**: Role-based access control for ticket creation and acknowledgment actions

### Access

Navigate to `/production-errors` from the sidebar menu. Requires authentication.

### Backend Dependencies

- Story 9-U-5: Production Error Dashboard Backend APIs
- Story 10-U-1: Socket.IO Real-Time Infrastructure

## License

Proprietary - Dark Software Factory
