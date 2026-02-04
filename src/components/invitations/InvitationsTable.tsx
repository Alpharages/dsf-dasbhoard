import { useState } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

    const columns: ColumnDef<Invitation>[] = [
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
    ];

    const table = useReactTable({
        data: invitations,
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
            globalFilter: statusFilter === 'all' ? undefined : statusFilter, // Using global filter logic or column filter?
            // Actually let's use column filter for status
            columnFilters: statusFilter === 'all' ? [] : [{ id: 'status', value: statusFilter }],
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
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value={InvitationStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={InvitationStatus.ACCEPTED}>Accepted</SelectItem>
                            <SelectItem value={InvitationStatus.EXPIRED}>Expired</SelectItem>
                            <SelectItem value={InvitationStatus.REVOKED}>Revoked</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-slate-400">
                        Showing {table.getFilteredRowModel().rows.length} of {invitations.length} invitations
                    </span>
                </div>

                {/* Add search by email here if needed later (AC#8 mentions email search input) */}
            </div>

            <div className="hidden md:block rounded-md border border-slate-800">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-slate-900/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-slate-400">
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
                                    className="border-slate-800 hover:bg-slate-800/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-slate-200">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                                    No invitations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const invitation = row.original;
                        const isPending = invitation.status === InvitationStatus.PENDING;
                        return (
                            <Card key={row.id} className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-slate-200">{invitation.email}</div>
                                            <div className="text-xs text-slate-500 mt-1">
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
                    <div className="text-center text-slate-400 py-8 border border-dashed border-slate-800 rounded-lg">
                        No invitations found.
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-400">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
