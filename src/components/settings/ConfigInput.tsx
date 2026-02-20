import { Eye, EyeOff, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConfigInputProps {
    label: string;
    description?: string;
    value: string;
    onChange?: (value: string) => void;
    type?: 'text' | 'number' | 'toggle' | 'password';
    isSecret?: boolean;
    onSave?: (value: string) => void;
    isSaving?: boolean;
}

export const ConfigInput = ({
    label,
    description,
    value,
    onChange,
    type = 'text',
    isSecret = false,
    onSave,
    isSaving = false,
}: ConfigInputProps) => {
    const [showSecret, setShowSecret] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLocalValue(value);
        setIsDirty(false);
    }, [value]);

    const handleChange = (newValue: string) => {
        setLocalValue(newValue);
        setIsDirty(true);
        onChange?.(newValue);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(localValue);
            setIsDirty(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                        {label}
                    </label>
                    {description && (
                        <p className="text-xs text-muted-foreground max-w-md">{description}</p>
                    )}
                </div>
                {isDirty && onSave && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all"
                    >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="relative">
                {type === 'toggle' ? (
                    <button
                        onClick={() => handleChange(localValue === 'true' ? 'false' : 'true')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${localValue === 'true' ? 'bg-primary' : 'bg-muted'
                            }`}
                    >
                        <div
                            className={`w-4 h-4 bg-background rounded-full shadow-md transform transition-transform ${localValue === 'true' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                ) : (
                    <div className="relative">
                        <input
                            type={isSecret && !showSecret ? 'password' : type}
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                            disabled={isSaving}
                        />
                        {isSecret && (
                            <button
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
