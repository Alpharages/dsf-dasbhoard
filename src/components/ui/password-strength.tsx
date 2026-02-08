import { useMemo, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definition for zxcvbn result (will use installed package once npm cache is resolved)
interface ZXCVBNResult {
    score: number; // 0-4
    feedback: {
        warning: string;
        suggestions: string[];
    };
}

interface PasswordStrengthProps {
    password: string;
    onScoreChange?: (score: number) => void;
}

const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;
const strengthColors = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500'
} as const;

export function PasswordStrength({ password, onScoreChange }: PasswordStrengthProps) {
    const result = useMemo(() => {
        // Only calculate if password is at least 4 characters (avoid meaningless results)
        if (password.length < 4) {
            return { score: 0, feedback: { warning: '', suggestions: [] } };
        }

        try {
            // Dynamic import to handle missing module gracefully
            // @ts-ignore - using require for dynamic import, will work at runtime if zxcvbn is installed
            const zxcvbn = require('zxcvbn');
            return zxcvbn(password) as ZXCVBNResult;
        } catch (error) {
            console.warn('zxcvbn library not found, using basic strength calculation');
            // Fallback basic strength calculation (more conservative than original)
            let score = 0;
            if (password.length >= 8) score++;
            if (password.length >= 10) score++; // Require 10+ chars for higher scores
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
            if (/\d/.test(password) && /[@$!%*?&]/.test(password)) score++; // Both digit AND special char

            return {
                score: Math.min(score, 3), // Max score 3 in fallback (not as good as real zxcvbn)
                feedback: {
                    warning: '',
                    suggestions: score < 3 ? ['Use a longer password with mixed characters'] : []
                }
            };
        }
    }, [password]);

    const { score, feedback } = result;
    const strengthLabel = strengthLabels[score];
    const strengthColor = strengthColors[score as keyof typeof strengthColors];

    // Notify parent of score changes
    useEffect(() => {
        onScoreChange?.(score);
    }, [score, onScoreChange]);

    // Don't show strength meter if password is empty
    if (!password) {
        return null;
    }

    return (
        <div className="space-y-2 mt-2">
            {/* Strength Meter */}
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((segment) => (
                    <div
                        key={segment}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            segment < score ? strengthColor : "bg-muted"
                        )}
                    />
                ))}
            </div>

            {/* Strength Label */}
            <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${score <= 1 ? 'text-red-500' :
                    score === 2 ? 'text-orange-500' :
                        score === 3 ? 'text-yellow-500' :
                            'text-green-500'
                    }`}>
                    {strengthLabel} ({score}/4)
                </p>
            </div>

            {/* Suggestions (if score < 3) */}
            {score < 3 && feedback.suggestions.length > 0 && (
                <div className="space-y-1">
                    {feedback.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-xs text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
