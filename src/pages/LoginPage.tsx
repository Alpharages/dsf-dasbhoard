import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        general?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const returnUrl = searchParams.get('returnUrl') || '/';
            navigate(returnUrl, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, searchParams]);

    // Clear errors when user types
    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (errors.email || errors.general) {
            setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (errors.password || errors.general) {
            setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!email.includes('@') || !email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password, rememberMe);

            // Redirect handled by useEffect above after successful login
            const returnUrl = searchParams.get('returnUrl') || '/';
            navigate(returnUrl, { replace: true });
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Login failed. Please try again.';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading spinner during initial auth check
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        DSF Dashboard
                    </h1>
                    <p className="text-xl text-blue-100 leading-relaxed">
                        Accelerate your software development with AI-powered project management and quality automation.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-white">DSF Dashboard</h1>
                    </div>

                    {/* Login Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">Enter your credentials to access the dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    autoFocus
                                    className={errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-rose-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300 font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className={errors.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-sm text-rose-500 mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                />
                                <Label htmlFor="remember-me" className="text-sm text-slate-400 cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                    <p className="text-sm text-rose-500">{errors.general}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 text-base rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-500 text-sm mt-6">
                        © 2026 Dark Software Factory. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
