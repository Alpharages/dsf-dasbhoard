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
import { 
    ArrowUpDown, 
    Edit2, 
    ChevronLeft, 
    ChevronRight,
    User,
    MoreHorizontal,
    Mail,
    Clock,
    Shield
} from 'lucide-react';
import { type User as UserType } from '@/types/user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UsersTableProps {
    users: UserType[];
    isLoading: boolean;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: (pagination: Updater<PaginationState>) => void;
    sorting: SortingState;
    onSortingChange: (sorting: Updater<SortingState>) => void;
    onEdit: (user: UserType) => void;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-500/20 text-blue-600 border-blue-500/30',
        'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
        'bg-violet-500/20 text-violet-600 border-violet-500/30',
        'bg-amber-500/20 text-amber-600 border-amber-500/30',
        'bg-rose-500/20 text-rose-600 border-rose-500/30',
        'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const formatLastLogin = (date: string | null | undefined) => {
    if (!date) return { text: 'Never', isRecent: false };
    
    const loginDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 5) return { text: 'Just now', isRecent: true };
    if (diffMins < 60) return { text: `${diffMins}m ago`, isRecent: true };
    if (diffHours < 24) return { text: `${diffHours}h ago`, isRecent: diffHours < 2 };
    if (diffDays === 1) return { text: 'Yesterday', isRecent: false };
    if (diffDays < 7) return { text: `${diffDays} days ago`, isRecent: false };
    
    return { text: loginDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), isRecent: false };
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
    const columns: ColumnDef<UserType>[] = [
        {
            accessorKey: 'fullName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="pl-0 hover:bg-transparent font-semibold text-foreground/80 hover:text-foreground"
                    >
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        User
                        <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original;
                const avatarColor = getAvatarColor(user.fullName);
                return (
                    <div className="flex items-center gap-4">
                        <Avatar className={`h-10 w-10 border-2 ${avatarColor}`}>
                            <AvatarFallback className={`text-sm font-semibold ${avatarColor}`}>
                                {getInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{user.fullName}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'role',
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-foreground/80">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Role
                </div>
            ),
            cell: ({ row }) => (
                <RoleBadge role={row.original.role} />
            ),
        },
        {
            accessorKey: 'isActive',
            header: () => (
                <div className="font-semibold text-foreground/80">Status</div>
            ),
            cell: ({ row }) => (
                <StatusBadge status={row.original.isActive ? 'Active' : 'Inactive'} />
            ),
        },
        {
            accessorKey: 'lastLoginAt',
            header: () => (
                <div className="flex items-center gap-2 font-semibold text-foreground/80">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Last Login
                </div>
            ),
            cell: ({ row }) => {
                const { text, isRecent } = formatLastLogin(row.original.lastLoginAt);
                return (
                    <div className="flex items-center gap-2">
                        {isRecent && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                        <span className={isRecent ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                            {text}
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => (
                <div className="font-semibold text-foreground/80 text-right">Actions</div>
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-accent"
                                >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
        manualSorting: true,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-border hover:bg-transparent">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableHead key={i}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="border-border">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-48" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
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
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-muted-foreground py-4">
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
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-border hover:bg-muted/30 transition-colors"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-foreground py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <div className="text-muted-foreground font-medium">No users found</div>
                                        <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => {
                        const user = row.original;
                        const avatarColor = getAvatarColor(user.fullName);
                        const { text, isRecent } = formatLastLogin(user.lastLoginAt);
                        return (
                            <Card 
                                key={row.id} 
                                className="bg-card border-border overflow-hidden hover:shadow-md transition-shadow"
                                style={{
                                    animation: `fadeIn 0.3s ease-out ${index * 50}ms both`,
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className={`h-12 w-12 border-2 ${avatarColor}`}>
                                                <AvatarFallback className={`text-base font-semibold ${avatarColor}`}>
                                                    {getInitials(user.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-foreground">{user.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 -mt-1 -mr-1"
                                                >
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        <RoleBadge role={user.role} />
                                        <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className={isRecent ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                                            {text}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 border border-dashed border-border rounded-xl bg-card/50">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div className="text-muted-foreground font-medium">No users found</div>
                        <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                        Page <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                        <span className="font-medium text-foreground">{table.getPageCount()}</span>
                    </span>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[80px] bg-background border-input">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="gap-1"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
