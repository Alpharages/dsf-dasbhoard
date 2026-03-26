import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AIProvider } from '@/api/aiRoutingConfigApi';

interface ProviderSelectProps {
  value: AIProvider | null;
  onChange: (value: AIProvider | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowNull?: boolean;
}

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'CLAUDE_CODE', label: 'Claude Code' },
  { value: 'GEMINI', label: 'Gemini' },
  { value: 'CODEX', label: 'Codex' },
  { value: 'KIMI', label: 'Kimi' },
];

export function ProviderSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select provider',
  allowNull = false,
}: ProviderSelectProps) {
  // Use empty string as sentinel for null only when the empty SelectItem is rendered (allowNull=true)
  // When allowNull=false, undefined lets Radix show the placeholder instead of an unmatched value
  const selectValue = value !== null ? value : (allowNull ? '' : undefined);

  const handleValueChange = (val: string) => {
    onChange(val === '' ? null : (val as AIProvider));
  };

  return (
    <Select value={selectValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowNull && (
          <SelectItem value="">
            <span className="text-muted-foreground italic">Inherit from global</span>
          </SelectItem>
        )}
        {PROVIDERS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
