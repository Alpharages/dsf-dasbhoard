import {
    useReactTable,
    getCoreRowModel,
    type ColumnDef,
    flexRender,
    type SortingState,
    type PaginationState,
    type Updater,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUpDown, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { type User } from '@/types/user';

interface UsersTableProps {
    users: User[];
    isLoading: boolean;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: (pagination: Updater<PaginationState>) => void;
    sorting: SortingState;
    onSortingChange: (sorting: Updater<SortingState>) => void;
    onEdit: (user: User) => void;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export function UsersTable({
    users,
    isLoading,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    onEdit
}: UsersTableProps) {
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'fullName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="pl-0 hover:bg-transparent"
                    >
                        User
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-200">{user.fullName}</span>
                            <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                    </div>
                );
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
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <StatusBadge status={row.original.isActive ? 'Active' : 'Inactive'} />
            ),
        },
        {
            accessorKey: 'lastLoginAt',
            header: 'Last Login',
            cell: ({ row }) => {
                const date = row.original.lastLoginAt;
                return date ? new Date(date).toLocaleString() : 'Never';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.original)}
                        title="Edit User"
                        className="hover:bg-slate-800"
                    >
                        <Edit2 className="h-4 w-4 text-slate-400 hover:text-white" />
                    </Button>
                );
            },
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange,
        onSortingChange,
        manualSorting: true, // Assuming sorting handled by API params
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="border rounded-md border-slate-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="border-slate-800">
                                    {[1, 2, 3, 4, 5].map((j) => (
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
                                    No users found.
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
                        const user = row.original;
                        return (
                            <Card key={row.id} className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-200">{user.fullName}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(user)}
                                            className="h-8 w-8 text-slate-400"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex justify-between items-center mt-2">
                                        <RoleBadge role={user.role} />
                                        <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500 text-right">
                                        Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 py-8 border border-dashed border-slate-800 rounded-lg">
                        No users found.
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
