export interface RegisterRequest {
    inviteToken: string;
    password: string;
    fullName: string;
}

export interface RegisterResponse {
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
