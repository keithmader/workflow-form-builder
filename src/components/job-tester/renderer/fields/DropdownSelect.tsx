import type { DropdownFieldConfig } from '@/types/schema';
import type { EnumOptionsConfig } from '@/types/schema';

interface DropdownSelectProps {
  field: DropdownFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  enumOverride?: EnumOptionsConfig;
}

export function DropdownSelect({ field, value, onChange, disabled, error, enumOverride }: DropdownSelectProps) {
  const options = getOptions(enumOverride ?? field.enumOptions);

  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || field.isUneditable}
        className={`w-full px-3 py-2 rounded-md border text-sm bg-background ${
          error ? 'border-red-500' : 'border-border'
        } focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50`}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function getOptions(enumOptions: EnumOptionsConfig | null): { label: string; value: string }[] {
  if (!enumOptions) return [];
  if (enumOptions.type === 'paired' && enumOptions.options.value) {
    return enumOptions.options.value.map((o) => ({ label: o.label, value: o.value }));
  }
  if (enumOptions.type === 'simple' && enumOptions.options.value) {
    return enumOptions.options.value.map((v) => ({ label: v, value: v }));
  }
  return [];
}
