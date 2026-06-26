/**
 * 403 Forbidden Page
 * Displayed when user is authenticated but doesn't have required role permissions
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ForbiddenPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Get required role from navigation state
    const requiredRole = (location.state as { requiredRole?: string })?.requiredRole || 'Unknown';

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card container with dark theme */}
                <div className="bg-card border border-border rounded-lg p-8 text-center shadow-xl">
                    {/* Lock icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-rose-500/10 rounded-full">
                            <Lock className="w-16 h-16 text-rose-500" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        403 Forbidden
                    </h1>

                    {/* Message */}
                    <p className="text-muted-foreground mb-6">
                        You don't have permission to access this page
                    </p>

                    {/* Role information */}
                    <div className="space-y-2 mb-6 text-sm">
                        <p className="text-muted-foreground">
                            Your role: <span className="font-medium text-muted-foreground">{user?.role || 'Unknown'}</span>
                        </p>
                        <p className="text-rose-400">
                            Required: <span className="font-medium">{requiredRole}</span>
                        </p>
                    </div>

                    {/* Back button */}
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </Button>

                    {/* Contact admin message */}
                    <p className="text-muted-foreground text-sm mt-6">
                        Contact your administrator to request access
                    </p>
                </div>
            </div>
        </div>
    );
}
