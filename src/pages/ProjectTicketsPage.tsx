import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Play,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getProject, updateProject } from '@/api/projectsApi';
import { Switch } from '@/components/ui/switch';
import {
    listTickets,
    dispatchTickets,
    getTicketOptions,
    updateTicket,
    TICKET_STATUSES,
} from '@/api/ticketsApi';
import { GitBranch } from 'lucide-react';

const PAGE_SIZE = 20;
const ALL_STATUSES = '__all__';
// Radix Select needs a non-empty value, so these stand in for "no board status
// recorded yet" and "use the project's default branch".
const UNSET = '__unset__';
const DEFAULT_BRANCH = '__default__';

/**
 * Manual ticket dispatch. Lists a project's tickets — searched, filtered and
 * paginated entirely server-side, so a project with thousands of tickets fetches
 * one page — and lets a human send one, or a checked batch, into execution.
 * Meant for projects with `manual_dispatch` on, where syncing ingests everything
 * but auto-runs nothing.
 */
export function ProjectTicketsPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>(ALL_STATUSES);
    const [page, setPage] = useState(1);
    // Survives paging: tick rows across pages, then send them in one go.
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Debounced: one request per pause in typing rather than one per keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Page resets live in the handlers below, not an effect: a filter change is a
    // user event, and resetting there avoids a second render pass.
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['project-tickets', projectId, search, status, page],
        queryFn: () =>
            listTickets({
                projectId,
                query: search,
                status: status === ALL_STATUSES ? undefined : status,
                page,
                limit: PAGE_SIZE,
            }),
        enabled: !!projectId,
        // Keeps the old page on screen while the next one loads instead of flashing empty.
        placeholderData: keepPreviousData,
    });

    // Board statuses and repo branches for the two per-row editors. One request
    // per project, cached — neither list changes often.
    const { data: options } = useQuery({
        queryKey: ['ticket-options', projectId],
        queryFn: () => getTicketOptions(projectId!),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

    const editMutation = useMutation({
        mutationFn: ({
            ticketId,
            payload,
        }: {
            ticketId: string;
            payload: { base_branch?: string; status?: string };
        }) => updateTicket(ticketId, payload),
        onSuccess: (_updated, variables) => {
            toast.success(
                variables.payload.status !== undefined
                    ? 'Status updated in ClickUp'
                    : 'Base branch saved',
            );
            queryClient.invalidateQueries({ queryKey: ['project-tickets', projectId] });
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (error instanceof Error ? error.message : 'Could not update the ticket');
            toast.error(message);
        },
    });

    const tickets = useMemo(() => data?.data ?? [], [data]);
    const total = data?.pagination.total ?? 0;
    const totalPages = data?.pagination.total_pages ?? 1;
    const pageChecked = tickets.length > 0 && tickets.every((t) => selected.has(t.id));

    const toggle = (ticketId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(ticketId)) next.delete(ticketId);
            else next.add(ticketId);
            return next;
        });
    };

    // Select-all covers the visible page only — the rest is on the server.
    const togglePage = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            tickets.forEach((t) => (pageChecked ? next.delete(t.id) : next.add(t.id)));
            return next;
        });
    };

    // The toggle lives here as well as in Project Settings: this is the page where
    // you notice you need it, and hunting for a settings tab to flip it is the
    // friction that made people ask where it was.
    const manualDispatchMutation = useMutation({
        mutationFn: (value: boolean) => updateProject(projectId!, { manual_dispatch: value }),
        onSuccess: (updated) => {
            toast.success(
                updated.manual_dispatch
                    ? 'Manual dispatch ON — synced tickets will wait for you'
                    : 'Manual dispatch OFF — synced tickets auto-execute again',
            );
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (error instanceof Error ? error.message : 'Could not change the setting');
            toast.error(message);
        },
    });

    const dispatchMutation = useMutation({
        mutationFn: (ticketIds: string[]) => dispatchTickets(ticketIds),
        onSuccess: (ack) => {
            // The runs start in the background, so this only confirms acceptance.
            // Guard outcomes (already running, blocked, loop cap) show up on the
            // Executions page and in the ticket status, not here.
            toast.success(`${ack.accepted} ticket(s) sent — track progress on Executions`);
            setSelected(new Set());
            queryClient.invalidateQueries({ queryKey: ['project-tickets', projectId] });
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (error instanceof Error ? error.message : 'Dispatch failed');
            toast.error(message);
        },
    });

    const hasFilters = search !== '' || status !== ALL_STATUSES;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <Link
                        to="/projects/sync"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Projects
                    </Link>
                    <h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-foreground">
                        {project?.name ?? 'Tickets'}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2">
                            <Switch
                                checked={project?.manual_dispatch ?? false}
                                onCheckedChange={(value) => manualDispatchMutation.mutate(value)}
                                disabled={!project || manualDispatchMutation.isPending}
                            />
                            <span className="text-sm font-medium text-foreground">Manual dispatch</span>
                        </label>
                        <span className="text-sm text-muted-foreground">
                            {project?.manual_dispatch
                                ? 'ON — syncing still pulls tickets in, but nothing runs until you send it.'
                                : 'OFF — synced tickets auto-execute. You can still send one manually.'}
                        </span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => refetch()}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by title or task id"
                        className="h-9 bg-background/50 pl-8 pr-8 text-sm"
                    />
                    {searchInput && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setPage(1);
                            }}
                            className="absolute right-2 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="h-9 w-full text-sm sm:w-[220px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                        {TICKET_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-muted-foreground"
                        onClick={() => {
                            setSearchInput('');
                            setStatus(ALL_STATUSES);
                            setPage(1);
                        }}
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Sticky so the action stays reachable however far down the list you
                select — it used to live in the page header, which scrolls away. */}
            {selected.size > 0 && (
                <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-foreground">
                        <strong>{selected.size}</strong> ticket{selected.size === 1 ? '' : 's'} selected
                        {totalPages > 1 && (
                            <span className="text-muted-foreground"> · selection is kept across pages</span>
                        )}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() => setSelected(new Set())}
                            disabled={dispatchMutation.isPending}
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            className="h-9"
                            disabled={dispatchMutation.isPending}
                            onClick={() => dispatchMutation.mutate([...selected])}
                        >
                            {dispatchMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            Send {selected.size} to Execution
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="w-10 pl-4">
                                <Checkbox
                                    checked={pageChecked}
                                    onCheckedChange={togglePage}
                                    disabled={tickets.length === 0}
                                    aria-label="Select all tickets on this page"
                                />
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                                Ticket
                            </TableHead>
                            <TableHead className="w-40 text-xs font-bold uppercase text-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="w-52 text-xs font-bold uppercase text-muted-foreground">
                                Board status
                            </TableHead>
                            <TableHead className="w-52 text-xs font-bold uppercase text-muted-foreground">
                                Base branch
                            </TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`} className="border-border">
                                    <TableCell colSpan={7} className="py-3">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}

                        {!isLoading &&
                            tickets.map((ticket) => (
                                <TableRow
                                    key={ticket.id}
                                    data-state={selected.has(ticket.id) ? 'selected' : undefined}
                                    className="border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5"
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={selected.has(ticket.id)}
                                            onCheckedChange={() => toggle(ticket.id)}
                                            aria-label={`Select ${ticket.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-0">
                                        <div className="truncate font-semibold text-foreground">{ticket.name}</div>
                                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                            {ticket.clickup_task_id}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>

                                    {/* Board status decides which skill a manual run uses, so it
                                        is editable here — writing straight through to ClickUp. */}
                                    <TableCell>
                                        {options && options.statuses.length > 0 ? (
                                            <Select
                                                value={ticket.provider_status ?? UNSET}
                                                onValueChange={(value) =>
                                                    editMutation.mutate({
                                                        ticketId: ticket.id,
                                                        payload: { status: value },
                                                    })
                                                }
                                                disabled={editMutation.isPending}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Unknown" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ticket.provider_status === null && (
                                                        <SelectItem value={UNSET} disabled>
                                                            Unknown — sync to load
                                                        </SelectItem>
                                                    )}
                                                    {options.statuses.map((s) => (
                                                        <SelectItem key={s.name} value={s.name}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {ticket.provider_status ?? '—'}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Base branch: the ticket's work branch forks from this.
                                        Needed when the code lives on a branch that was never
                                        merged to the default branch. */}
                                    <TableCell>
                                        {options && options.branches.length > 0 ? (
                                            <Select
                                                value={ticket.base_branch ?? DEFAULT_BRANCH}
                                                onValueChange={(value) =>
                                                    editMutation.mutate({
                                                        ticketId: ticket.id,
                                                        payload: {
                                                            base_branch: value === DEFAULT_BRANCH ? '' : value,
                                                        },
                                                    })
                                                }
                                                disabled={editMutation.isPending}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={DEFAULT_BRANCH}>
                                                        Default ({options.defaultBranch})
                                                    </SelectItem>
                                                    {options.branches.map((b) => (
                                                        <SelectItem key={b} value={b}>
                                                            {b}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <GitBranch className="h-3 w-3" />
                                                {ticket.base_branch ?? 'default'}
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(ticket.updated_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="pr-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={dispatchMutation.isPending}
                                            onClick={() => dispatchMutation.mutate([ticket.id])}
                                        >
                                            <Play className="mr-1 h-3.5 w-3.5" /> Run
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                {!isLoading && tickets.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        {hasFilters
                            ? 'No tickets match these filters.'
                            : 'No tickets found. Sync the project to pull tickets in.'}
                    </div>
                )}
            </div>

            {/* Pagination — server-side: only the current page is ever fetched. */}
            {total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
                    <span>
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={page <= 1 || isFetching}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                        </Button>
                        <span className="px-1 text-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={page >= totalPages || isFetching}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
