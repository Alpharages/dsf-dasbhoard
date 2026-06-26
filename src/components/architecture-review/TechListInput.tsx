import { useState } from 'react';
import { X } from 'lucide-react';

interface TechListInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function TechListInput({ value, onChange, placeholder = "Press Enter to add..." }: TechListInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!value.includes(inputValue.trim())) {
                onChange([...value, inputValue.trim()]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeItem = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-2 bg-card border border-border rounded-lg min-h-[42px]">
                {value.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-sm font-medium">
                        <span>{item}</span>
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="hover:text-blue-300 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground">
                </input>
            </div>
            <p className="text-xs text-muted-foreground">
                {value.length} package{value.length !== 1 ? 's' : ''} added
            </p>
        </div>
    );
}
