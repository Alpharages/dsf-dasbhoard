import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    type ColumnDef,
    flexRender,
    type SortingState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { Copy, XCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Invitation, InvitationStatus } from '@/types/invitation';

interface InvitationsTableProps {
    invitations: Invitation[];
    isLoading: boolean;
    onCopyLink: (invitation: Invitation) => void;
    onRevoke: (invitation: Invitation) => void;
}

const EMPTY_INVITATIONS: Invitation[] = [];
const PAGE_SIZES = [10, 25, 50, 100];

export function InvitationsTable({
    invitations,
    isLoading,
    onCopyLink,
    onRevoke
}: InvitationsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    });

    const data = invitations ?? EMPTY_INVITATIONS;
    const columns = useMemo<ColumnDef<Invitation>[]>(() => [
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="pl-0 hover:bg-transparent"
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <RoleBadge role={row.original.role} />
            ),
        },
        {
            accessorKey: 'invitedByName',
            header: 'Invited By',
            cell: ({ row }) => row.original.invitedByName || 'System',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <StatusBadge status={row.original.status} />
            ),
            filterFn: (row, id, value) => {
                if (value === 'all') return true;
                return row.getValue(id) === value;
            },
        },
        {
            accessorKey: 'expiresAt',
            header: 'Expires At',
            cell: ({ row }) => new Date(row.original.expiresAt).toLocaleDateString(),
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const invitation = row.original;
                const isPending = invitation.status === InvitationStatus.PENDING;

                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={!isPending}
                            onClick={() => onCopyLink(invitation)}
                            title="Copy invite link"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        {isPending && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRevoke(invitation)}
                                title="Revoke invitation"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [onCopyLink, onRevoke]);

    const columnFilters = useMemo(
        () => statusFilter === 'all' ? [] : [{ id: 'status', value: statusFilter }],
        [statusFilter]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
            columnFilters,
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    {[1, 2, 3, 4, 5, 6].map((j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value);
                            setPagination((current) => ({ ...current, pageIndex: 0 }));
                        }}
                        aria-label="Filter by status"
                        className="h-9 w-[180px] rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="all">All Statuses</option>
                        <option value={InvitationStatus.PENDING}>Pending</option>
                        <option value={InvitationStatus.ACCEPTED}>Accepted</option>
                        <option value={InvitationStatus.EXPIRED}>Expired</option>
                        <option value={InvitationStatus.REVOKED}>Revoked</option>
                    </select>
                    <span className="text-sm text-muted-foreground">
                        Showing {table.getFilteredRowModel().rows.length} of {data.length} invitations
                    </span>
                </div>
            </div>

            <div className="hidden md:block rounded-md border border-border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border hover:bg-card/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-border hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-foreground">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No invitations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const invitation = row.original;
                        const isPending = invitation.status === InvitationStatus.PENDING;
                        return (
                            <Card key={row.id} className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-foreground">{invitation.email}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <RoleBadge role={invitation.role} />
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex justify-between items-center mt-2">
                                        <StatusBadge status={invitation.status} />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={!isPending}
                                                onClick={() => onCopyLink(invitation)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            {isPending && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRevoke(invitation)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                        No invitations found.
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
                    </p>
                    <select
                        value={`${table.getState().pagination.pageSize}`}
                        onChange={(event) => table.setPageSize(Number(event.target.value))}
                        aria-label="Rows per page"
                        className="h-8 w-[70px] rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {PAGE_SIZES.map((pageSize) => (
                            <option key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
