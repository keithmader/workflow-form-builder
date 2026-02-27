import type { RadioFieldConfig } from '@/types/schema';
import type { EnumOptionsConfig } from '@/types/schema';

interface RadioGroupProps {
  field: RadioFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  enumOverride?: EnumOptionsConfig;
}

export function RadioGroup({ field, value, onChange, disabled, error, enumOverride }: RadioGroupProps) {
  const options = getOptions(enumOverride ?? field.enumOptions);

  return (
    <div className="space-y-1">
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.widgetName}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled || field.isUneditable}
              className="h-4 w-4"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No options available</p>
        )}
      </div>
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
