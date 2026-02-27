import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { canAccess } from '../utils/roleHelpers';

// User interface matching backend UserDto
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'MANAGER' | 'PM' | 'TL' | 'QA' | 'VIEWER';
    isActive: boolean;
    lastLoginAt: string | null;
}

// AuthContext value interface
interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Token storage helpers
const getStorageType = (rememberMe: boolean): Storage => {
    return rememberMe ? localStorage : sessionStorage;
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

const getRefreshToken = (): string | null => {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

const setTokens = (accessToken: string, refreshToken: string, rememberMe: boolean) => {
    const storage = getStorageType(rememberMe);
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);

    // Clear from the other storage type
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem('access_token');
    otherStorage.removeItem('refresh_token');
};

const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
};

// Decode JWT to get expiration time
const decodeToken = (token: string): { exp: number } | null => {
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        return decoded;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    // Initialize to true to prevent login page flash during initial auth check
    const [isLoading, setIsLoading] = useState(true);
    const refreshTimeoutRef = useRef<number | null>(null);
    const navigate = useNavigate();

    // Setup auto-refresh timer
    const setupAutoRefresh = useCallback((accessToken: string) => {
        // Clear existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        const decoded = decodeToken(accessToken);
        if (!decoded || !decoded.exp) {
            return;
        }

        // Calculate time until refresh (5 minutes before expiry)
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const refreshTime = expiresAt - now - (5 * 60 * 1000); // 5 min buffer

        if (refreshTime > 0) {
            refreshTimeoutRef.current = setTimeout(async () => {
                try {
                    await refreshTokenInternal();
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                    // Clear tokens and redirect to login on auto-refresh failure
                    clearTokens();
                    setUser(null);
                    const returnUrl = window.location.pathname;
                    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                    toast.error('Session expired. Please log in again.');
                }
            }, refreshTime);
        }
    }, []);

    // Fetch current user from /auth/me
    const fetchUser = useCallback(async (): Promise<User | null> => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error: any) {
            // On rate limiting (429), wait briefly and retry once before giving up.
            // This prevents a transient throttle burst from incorrectly clearing the
            // session — the user's token is still valid, the server is just busy.
            if (error?.response?.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 800));
                try {
                    const retryResponse = await apiClient.get('/auth/me');
                    return retryResponse.data;
                } catch (retryError) {
                    console.error('Failed to fetch user after rate-limit retry:', retryError);
                    return null;
                }
            }
            console.error('Failed to fetch user:', error);
            return null;
        }
    }, []);

    // Internal refresh token function
    const refreshTokenInternal = useCallback(async () => {
        const refreshTkn = getRefreshToken();
        if (!refreshTkn) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiClient.post('/auth/refresh', {
                refreshToken: refreshTkn
            });

            const { accessToken } = response.data;

            // Determine storage type based on where the refresh token is stored
            const rememberMe = localStorage.getItem('refresh_token') !== null;
            const storage = getStorageType(rememberMe);
            storage.setItem('access_token', accessToken);
            // H-3: Notify SocketContext (same-tab) to reconnect with the rotated token
            window.dispatchEvent(new CustomEvent('tokenRefreshed'));

            // Setup next auto-refresh
            setupAutoRefresh(accessToken);
        } catch (error: any) {
            console.error('Token refresh failed:', error);

            // Clear tokens and redirect to login if refresh fails (401/403)
            if (error.response?.status === 401 || error.response?.status === 403) {
                clearTokens();
                setUser(null);
                const returnUrl = window.location.pathname;
                navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                toast.error('Session expired. Please log in again.');
            }
            throw error;
        }
    }, [setupAutoRefresh, navigate]);

    // Login method
    const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
        setIsLoading(true);
        try {
            // Call login API
            const response = await apiClient.post('/auth/login', {
                email,
                password
            });

            const { accessToken, refreshToken, user: userData } = response.data;

            // Store tokens
            setTokens(accessToken, refreshToken, rememberMe);

            // Set user state (backend /auth/login returns full user object)
            // Note: AC#3 satisfied by login response, no additional /me call needed
            setUser(userData);

            // Setup auto-refresh
            setupAutoRefresh(accessToken);

            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('Login failed:', error);

            // Handle different error types
            if (error.response?.status === 401) {
                throw new Error('Invalid email or password');
            } else if (error.response?.status === 403) {
                throw new Error('Your account has been deactivated. Contact admin.');
            } else if (error.response?.status === 429) {
                throw new Error('Too many login attempts. Try again in 15 minutes.');
            } else if (!error.response) {
                throw new Error('Unable to connect. Check your internet connection.');
            } else {
                throw new Error('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [setupAutoRefresh]);

    // Logout method
    const logout = useCallback(async () => {
        const refreshTkn = getRefreshToken();

        try {
            // Call logout API to revoke refresh token
            if (refreshTkn) {
                await apiClient.post('/auth/logout', {
                    refreshToken: refreshTkn
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API fails
        }

        // Clear tokens and user state
        clearTokens();
        setUser(null);

        // Clear auto-refresh timer
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Redirect to login
        navigate('/login');
        toast.success('Logged out successfully');
    }, [navigate]);

    // Public refresh token method
    const refreshToken = useCallback(async () => {
        await refreshTokenInternal();
    }, [refreshTokenInternal]);

    // Initial auth check on mount
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = getAccessToken();

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            // Validate token by fetching user
            const userData = await fetchUser();

            if (userData) {
                setUser(userData);
                setupAutoRefresh(accessToken);
            } else {
                // Token invalid, clear it
                clearTokens();
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [fetchUser, setupAutoRefresh]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth hook
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * useHasRole hook - Check if user has required role or higher in hierarchy
 * 
 * Role Hierarchy: ADMIN > MANAGER > TL > PM > QA > VIEWER
 * 
 * Example:
 * const isAdmin = useHasRole('ADMIN');
 * const canManage = useHasRole('MANAGER'); // true for ADMIN and MANAGER
 * 
 * @param requiredRole - Role to check against
 * @returns true if user has the required role or higher in hierarchy
 */
export function useHasRole(requiredRole: string): boolean {
    const { user } = useAuth();
    if (!user) return false;
    return canAccess(user.role, requiredRole);
}

/**
 * useRequireAuth hook - Enhanced auth hook with role guard function
 * 
 * Use this hook when you need to enforce role requirements within components
 * 
 * Example:
 * const { requireRole } = useRequireAuth();
 * useEffect(() => {
 *   requireRole('ADMIN'); // Throws error if user is not ADMIN or higher
 * }, []);
 * 
 * @returns Auth context with requireRole function
 */
export function useRequireAuth() {
    const auth = useAuth();

    const requireRole = (role: string) => {
        if (!auth.user) {
            throw new Error('User must be authenticated');
        }

        if (!canAccess(auth.user.role, role)) {
            throw new Error(`Access denied. Required role: ${role}`);
        }
    };

    return { ...auth, requireRole };
}
