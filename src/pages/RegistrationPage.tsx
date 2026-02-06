import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { PasswordStrength } from '../components/ui/password-strength';
import { toast } from 'react-hot-toast';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/client';
import type { RegisterRequest, RegisterResponse } from '../types/auth';

// Role badge colors
const roleColors = {
    ADMIN: 'bg-destructive text-destructive-foreground border-destructive',
    MANAGER: 'bg-indigo-500 text-white border-indigo-500', // Keep specific colors for roles if desired, or map to semantic
    TL: 'bg-blue-500 text-white border-blue-500',
    PM: 'bg-emerald-500 text-white border-emerald-500',
    QA: 'bg-amber-500 text-black border-amber-500',
    VIEWER: 'bg-secondary text-secondary-foreground border-secondary'
} as const;

export function RegistrationPage() {
    const navigate = useNavigate();
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const { user: currentUser } = useAuth(); // Already logged in check

    const [fullName, setFullName] = useState('');
    const [email] = useState('');
    const [role] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Initialize to true for token verification
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{
        fullName?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    }>({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Clear errors when user types
    const handleFullNameChange = (value: string) => {
        setFullName(value);
        if (errors.fullName || errors.general) {
            setErrors(prev => ({ ...prev, fullName: undefined, general: undefined }));
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (errors.password || errors.general) {
            setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
        }
        // Password strength will be calculated by PasswordStrength component
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (errors.confirmPassword || errors.general) {
            setErrors(prev => ({ ...prev, confirmPassword: undefined, general: undefined }));
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: { fullName?: string; password?: string; confirmPassword?: string } = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        } else if (fullName.trim().length > 100) {
            newErrors.fullName = 'Full name must be less than 100 characters';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!inviteToken) {
            setTokenError('Invalid invitation link');
            return;
        }

        if (!validateForm()) {
            return;
        }

        // Check password strength
        if (passwordStrength < 2) {
            setErrors({ password: 'Password is too weak. Please use a stronger password.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData: RegisterRequest = {
                inviteToken,
                password,
                fullName: fullName.trim()
            };

            const response = await apiClient.post<RegisterResponse>('/auth/register', requestData);
            const { accessToken, refreshToken, user } = response.data;

            // Auto-login: Store tokens directly (AC#5 - DO NOT call backend login again)
            // Use localStorage by default for new registrations (remember me behavior)
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Show success toast with personalized message
            toast.success(`Account created successfully! Welcome, ${user.fullName}`);

            // Redirect to dashboard - page will reload and AuthProvider will pick up tokens
            navigate('/', { replace: true });
        } catch (error: any) {
            console.error('Registration error:', error);
            const status = error.response?.status;
            const message = error.response?.data?.message || '';

            if (status === 400) {
                if (message.includes('accepted') || message.includes('already used')) {
                    setTokenError('This invitation has already been used');
                } else {
                    setErrors({ general: message || 'Invalid registration data. Please check your input.' });
                }
            } else if (status === 404) {
                setTokenError('This invitation link is invalid or has been revoked');
            } else if (status === 409) {
                setErrors({ general: 'An account with this email already exists' });
            } else if (status === 410) {
                setTokenError('This invitation has expired. Please request a new one');
            } else if (!error.response) {
                setErrors({ general: 'Unable to connect. Check your internet connection.' });
            } else {
                setErrors({ general: 'Registration failed. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Token verification and already-logged-in check
    useEffect(() => {
        // Redirect if already logged in
        if (currentUser) {
            navigate('/', { replace: true });
            return;
        }

        if (!inviteToken) {
            setTokenError('Invalid invitation link');
            setIsLoading(false);
            return;
        }

        // Note: Backend doesn't have separate verify endpoint per story requirements
        // Email and role are fetched after registration in the response
        // This is a known limitation documented in story
        setIsLoading(false);
    }, [inviteToken, currentUser, navigate]);

    //  Auto-focus full name field after page load
    useEffect(() => {
        if (!isLoading && !tokenError) {
            const timer = setTimeout(() => {
                document.getElementById('fullName')?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading, tokenError]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Token error state
    if (tokenError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-8">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
                    <Lock className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-3">Invalid Invitation</h2>
                    <p className="text-muted-foreground mb-6">{tokenError}</p>
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    >
                        Go to Homepage
                    </Button>
                    <p className="text-sm text-muted-foreground mt-6">
                        Need help? Contact your administrator for a new invitation link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Join the Team
                    </h1>
                    <p className="text-xl text-purple-100 leading-relaxed">
                        Create your account to get started with DSF Dashboard and collaborate with your team.
                    </p>
                </div>
            </div>

            {/* Right side - Registration Form */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-foreground">Join the Team</h1>
                    </div>

                    {/* Registration Card */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
                            <p className="text-muted-foreground">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-muted-foreground font-medium">
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => handleFullNameChange(e.target.value)}
                                    autoFocus
                                    className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email Field (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    disabled
                                    value={email || 'Email from invitation'}
                                    className="bg-muted text-muted-foreground cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">Email is auto-filled from your invitation</p>
                            </div>

                            {/* Role Badge (Read-only) */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-medium">Assigned Role</Label>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={role && roleColors[role as keyof typeof roleColors] ? roleColors[role as keyof typeof roleColors] : 'bg-secondary text-secondary-foreground'}
                                    >
                                        {role || 'Role from invitation'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Your role ({role || 'determined by invitation'}) has been assigned by the administrator and cannot be changed during registration.
                                </p>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                                )}

                                {/* Password Strength Indicator */}
                                <PasswordStrength
                                    password={password}
                                    onScoreChange={(score) => setPasswordStrength(score)}
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-muted-foreground font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                        className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || passwordStrength < 2}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                title={passwordStrength < 2 ? 'Password too weak' : ''}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-muted-foreground text-sm mt-6">
                        © 2026 Dark Software Factory. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
