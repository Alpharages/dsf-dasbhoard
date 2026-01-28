---
name: dashboard-ui-engineering
description: Build data-intensive, real-time dashboard interfaces using the "dsf-dashboard" stack. This skill covers React 19, Tailwind CSS v4, shadcn/ui patterns (Radix + CVA), TanStack ecosystems (Query, Table), and data visualization (Recharts). Use for implementing complex forms, real-time data grids, PDF generation, and responsive layouts.
license: MIT
version: 1.0.0
---

# Dashboard UI Engineering Skill

Comprehensive skill for building professional, data-driven dashboards using the specific `dsf-dashboard` project stack. Focuses on React 19, Tailwind v4, and heavy data visualization.

## Reference

- **Styling:** Tailwind CSS v4 (https://tailwindcss.com/docs)
- **State/Data:** TanStack Query (https://tanstack.com/query)
- **Tables:** TanStack Table (https://tanstack.com/table)
- **Charts:** Recharts (https://recharts.org)
- **Forms:** React Hook Form + Zod (https://react-hook-form.com)

## When to Use This Skill

Use when:
- Building components for the `dsf-dashboard` project.
- Implementing data-rich tables with sorting, filtering, and pagination.
- Creating complex forms with Zod validation.
- Visualizing data using Recharts or Gauge components.
- handling real-time data updates via Socket.io.
- Generating PDF reports using `@react-pdf/renderer`.
- implementing accessible modal dialogs, popovers, or tooltips using Radix UI.
- Writing unit tests with Vitest and React Testing Library.

## Core Stack

### Framework & Runtime
- **Vite 7**: Build tool and dev server.
- **React 19**: UI Library (leveraging latest hooks/patterns).
- **TypeScript 5.9**: Strict type safety.

### Styling Layer (Tailwind v4)
- **@tailwindcss/vite**: Zero-config Vite integration.
- **CSS-first Configuration**: Configuration handled via CSS variables (`@theme`).
- **Utilities**: `clsx` and `tailwind-merge` for dynamic class construction.
- **Animations**: `tw-animate-css` for pre-built animations.

### Component Architecture
- **Headless UI**: Radix UI primitives (`@radix-ui/react-*`) for accessibility.
- **Variants**: `class-variance-authority` (CVA) for managing component styles.
- **Icons**: `lucide-react`.

### Data & State
- **Fetch**: Axios + TanStack Query (`@tanstack/react-query`) for server state.
- **Real-time**: `socket.io-client` for live dashboard updates.

## Quick Start & patterns

### Tailwind v4 Setup (Current Project)

The project uses Tailwind CSS v4. Configuration is typically handled in the CSS entry point rather than a JS config file.

**Vite Config (`vite.config.ts`):**
```ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), /* ... */],
})

```

**CSS Entry:**

```css
@import "tailwindcss";

@theme {
  /* Custom project tokens defined here in v4 */
  --color-brand-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}

```

### Component Construction (CVA Pattern)

Use `class-variance-authority` to build reusable UI components similar to shadcn/ui.

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils" // wrapper for clsx + tailwind-merge

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

```

## Common Project Patterns

### 1. Data Tables (TanStack Table)

Used for complex data grids.

```tsx
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"

export function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-left font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-muted/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

```

### 2. Validated Forms (Zod + React Hook Form)

Standard pattern for all user input in `dsf-dashboard`.

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const dashboardSettingsSchema = z.object({
  refreshRate: z.number().min(5).max(300),
  showNotifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"])
})

export function SettingsForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(dashboardSettingsSchema)
  })

  return (
    <form onSubmit={handleSubmit(data => console.log(data))} className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Refresh Rate (seconds)</label>
        <input 
          {...register("refreshRate", { valueAsNumber: true })}
          className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
        />
        {errors.refreshRate && <span className="text-red-500 text-xs">{errors.refreshRate.message}</span>}
      </div>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">
        Save Settings
      </button>
    </form>
  )
}

```

### 3. Data Visualization (Recharts)

Pattern for dashboard widgets.

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export function RevenueChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} />
          <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

```

## Best Practices

1. **Strict Package Manager**: Use `pnpm` exclusively (enforced by `package.json`).
2. **Date Handling**: Use `date-fns` for all date logic; avoid Moment.js.
3. **Real-time Optimization**: When using `socket.io-client`, wrap listeners in `useEffect` with cleanup functions to prevent memory leaks.
4. **Query Caching**: Leverage `useQuery` from `@tanstack/react-query` for API data to handle loading states and caching automatically.
5. **Type Safety**: Avoid `any`. Define Zod schemas for API responses to ensure runtime safety matches TypeScript types.
6. **Testing**: Write unit tests for logic using `vitest` and component tests with `@testing-library/react`.
7. **Toast Notifications**: Use `react-hot-toast` for user feedback (success/error states).

## Resources & Documentation

* **Dashboard Logic**: `src/lib/utils.ts` (Project CN helper)
* **Validation**: [Zod Documentation](https://zod.dev/)
* **Visuals**: [Lucide Icons](https://lucide.dev/icons/)
* **PDF Generation**: [React-PDF](https://react-pdf.org/)