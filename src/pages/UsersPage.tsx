import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UsersTable } from '@/components/users/UsersTable';
import { EditUserModal } from '@/components/users/EditUserModal';
import { usersApi } from '@/api/usersApi';
import type { User, UpdateUserRequest } from '@/types/user';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { Role } from '@/types/invitation';

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

    // Modal State
    const [editUser, setEditUser] = useState<User | null>(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await usersApi.getUsers({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: debouncedSearch || undefined,
                role: roleFilter !== 'all' ? (roleFilter as Role) : undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            });
            setUsers(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error('Failed to load users:', error);
            // toast.error('Failed to load users'); // Avoid spamming if it's just a connection blip, or show generic error
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, roleFilter, statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleEditSave = async (id: string, data: UpdateUserRequest) => {
        try {
            await usersApi.updateUser(id, data);
            toast.success('User updated successfully');
            setEditUser(null);
            await loadUsers(); // Refresh list
        } catch (error: any) {
            console.error('Update user error:', error);
            if (error.response?.status === 403) {
                // AC#4 Critical: Handle 403 Forbidden specifically
                toast.error(error.response?.data?.message || 'Cannot deactivate your own account or insufficient permissions');
            } else {
                toast.error('Failed to update user');
            }
            throw error; // Let modal handle loading state if needed
        }
    };

    const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
        setter(val);
        setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to page 1 on filter trigger
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <Users className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">User Management</h1>
                </div>
                <p className="text-slate-400">
                    View, search, and manage registered users and their access levels.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-slate-900 border-slate-700 hover:border-slate-600 focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={handleFilterChange(setRoleFilter)}>
                        <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="TL">Team Lead</SelectItem>
                            <SelectItem value="PM">Product Manager</SelectItem>
                            <SelectItem value="QA">QA</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                        <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

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

            <EditUserModal
                user={editUser}
                open={!!editUser}
                onClose={() => setEditUser(null)}
                onSave={handleEditSave}
            />
        </div>
    );
}
