# DSF Dashboard - Project Manager Interface

Dark Software Factory (DSF) Dashboard is a React-based frontend for monitoring AI-powered software development workflows.

## Features

- **Real-time Project Monitoring**: WebSocket-powered live updates for ticket execution status
- **Code Review Interface**: Review AI-generated code with quality metrics and confidence scores
- **Quality Gate Visualization**: View linting, testing, and security scan results
- **Approval Workflows**: Approve, reject, or request rework for AI-generated code

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP requests

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

Ensure the backend server is running on the configured `VITE_API_BASE_URL` before starting the dashboard.

## License

Proprietary - Dark Software Factory
