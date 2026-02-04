export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: 'ADMIN' | 'MANAGER' | 'PM' | 'TL' | 'QA' | 'VIEWER';
        isActive: boolean;
        lastLoginAt: string | null;
    };
}

export interface RegisterRequest {
    inviteToken: string;
    password: string;
    fullName: string;
}

export type RegisterResponse = LoginResponse;
