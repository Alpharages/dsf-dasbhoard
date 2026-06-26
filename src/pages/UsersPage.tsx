import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Search, Filter, RefreshCw, Shield, UserCheck, UserX, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UsersTable } from '@/components/users/UsersTable';
import { EditUserModal } from '@/components/users/EditUserModal';
import { usersApi } from '@/api/usersApi';
import type { User, UpdateUserRequest } from '@/types/user';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { Role } from '@/types/invitation';

const roleOptions = [
    { value: 'all', label: 'All Roles', icon: UsersRound },
    { value: 'ADMIN', label: 'Administrator', icon: Shield },
    { value: 'MANAGER', label: 'Manager', icon: Users },
    { value: 'TL', label: 'Team Lead', icon: UsersRound },
    { value: 'PM', label: 'Product Manager', icon: Users },
    { value: 'QA', label: 'QA Engineer', icon: UserCheck },
    { value: 'VIEWER', label: 'Viewer', icon: Users },
];

const statusOptions = [
    { value: 'all', label: 'All Statuses', icon: UsersRound },
    { value: 'active', label: 'Active', icon: UserCheck },
    { value: 'inactive', label: 'Inactive', icon: UserX },
];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    // Table State
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);

    // Filter State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal State
    const [editUser, setEditUser] = useState<User | null>(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadUsers = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        setIsLoading(true);
        try {
            const response = await usersApi.getUsers({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: debouncedSearch || undefined,
                role: roleFilter !== 'all' ? (roleFilter as Role) : undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            });
            setUsers(response.users);
            setMeta(response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, roleFilter, statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleRefresh = () => {
        loadUsers(true);
    };

    const handleEditSave = async (id: string, data: UpdateUserRequest) => {
        try {
            await usersApi.updateUser(id, data);
            toast.success('User updated successfully');
            setEditUser(null);
            await loadUsers();
        } catch (error: any) {
            console.error('Update user error:', error);
            if (error.response?.status === 403) {
                toast.error(error.response?.data?.message || 'Cannot deactivate your own account or insufficient permissions');
            } else {
                toast.error('Failed to update user');
            }
            throw error;
        }
    };

    const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
        setter(val);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const activeFiltersCount = (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 rounded-xl shadow-sm">
                            <Users className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage team members, roles, and access permissions
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="self-start sm:self-auto gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{meta.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">
                                    {users.filter(u => u.isActive).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {users.filter(u => u.role === 'ADMIN').length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <Card className="border-border/60 mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="relative w-full lg:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-background border-input focus-visible:ring-primary"
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="h-5 px-2 text-xs">
                                        {activeFiltersCount} active
                                    </Badge>
                                )}
                            </div>
                            
                            <Select value={roleFilter} onValueChange={handleFilterChange(setRoleFilter)}>
                                <SelectTrigger className="w-[160px] h-11 bg-background border-input">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            <div className="flex items-center gap-2">
                                                <role.icon className="h-4 w-4" />
                                                {role.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                                <SelectTrigger className="w-[160px] h-11 bg-background border-input">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            <div className="flex items-center gap-2">
                                                <status.icon className="h-4 w-4" />
                                                {status.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setRoleFilter('all');
                                        setStatusFilter('all');
                                        setSearch('');
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <UsersTable
                users={users}
                isLoading={isLoading}
                pageCount={meta.totalPages}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                onEdit={setEditUser}
            />

            {/* Edit Modal */}
            <EditUserModal
                user={editUser}
                open={!!editUser}
                onClose={() => setEditUser(null)}
                onSave={handleEditSave}
            />
        </div>
    );
}
