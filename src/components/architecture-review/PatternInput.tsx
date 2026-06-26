import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PatternInputProps {
    pattern: string;
    fileGlob: string;
    description?: string;
    onPatternChange: (pattern: string) => void;
    onFileGlobChange: (fileGlob: string) => void;
    onDescriptionChange: (description: string) => void;
}

export function PatternInput({
    pattern,
    fileGlob,
    description,
    onPatternChange,
    onFileGlobChange,
    onDescriptionChange
}: PatternInputProps) {
    const [isPatternValid, setIsPatternValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!pattern) {
            setIsPatternValid(null);
            return;
        }

        try {
            new RegExp(pattern);
            setIsPatternValid(true);
        } catch {
            setIsPatternValid(false);
        }
    }, [pattern]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Regex Pattern *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => onPatternChange(e.target.value)}
                        placeholder="e.g., /^[A-Z]/"
                        className="w-full px-3 py-2 pr-10 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </input>
                    {isPatternValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isPatternValid ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    )}
                </div>
                {isPatternValid === false && (
                    <p className="text-xs text-red-400">❌ Invalid regex pattern</p>
                )}
                {isPatternValid === true && (
                    <p className="text-xs text-green-400">✅ Valid regex pattern</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    File Glob *
                </label>
                <input
                    type="text"
                    value={fileGlob}
                    onChange={(e) => onFileGlobChange(e.target.value)}
                    placeholder="e.g., /src/**/*.ts"
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                </input>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Description (Optional)
                </label>
                <input
                    type="text"
                    value={description || ''}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="e.g., All classes must start with uppercase"
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                </input>
            </div>
        </div>
    );
}
