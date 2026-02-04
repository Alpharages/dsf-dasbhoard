import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ checked, onCheckedChange, className }, ref) => {
        const isChecked = checked === true;

        return (
            <button
                ref={ref}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => onCheckedChange?.(!isChecked)}
                className={`peer h-4 w-4 shrink-0 rounded-sm border border-slate-600 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isChecked ? "bg-blue-600 text-white" : "bg-transparent"
                } ${className || ''}`}
            >
                {isChecked ? (
                    <Check className="h-3 w-3" />
                ) : null}
            </button>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
