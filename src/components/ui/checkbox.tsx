import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked ? "bg-primary text-primary-foreground" : "bg-transparent",
                    className
                )}
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
