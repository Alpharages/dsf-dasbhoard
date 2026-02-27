import type { Role } from './invitation';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    // Additional fields mentioned in story
    invitationsSentCount?: number;
    activeRefreshTokensCount?: number;
}

export interface UserDetail extends User {
    // Add any specific detail fields if different from list view
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role | 'all'; // 'all' might be filtered by omitting the param
    isActive?: boolean | 'all'; // 'all' might be filtered by omitting
}

export interface UpdateUserRequest {
    role?: Role;
    isActive?: boolean;
}

export interface UsersResponse {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
