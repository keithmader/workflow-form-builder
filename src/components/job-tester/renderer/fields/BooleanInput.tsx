import type { BooleanFieldConfig, CheckboxFieldConfig } from '@/types/schema';

interface BooleanInputProps {
  field: BooleanFieldConfig | CheckboxFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}

export function BooleanInput({ field, value, onChange, disabled, error }: BooleanInputProps) {
  if (field.fieldType === 'checkbox') {
    const checked = value === true || value === 'true';
    return (
      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled || field.isUneditable}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm">{field.title || field.widgetName}</span>
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Boolean as Yes/No radio
  const strValue = String(value ?? '');
  const options = getEnumOptions(field as BooleanFieldConfig);

  return (
    <div className="space-y-1">
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.widgetName}
              value={opt.value}
              checked={strValue === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled || field.isUneditable}
              className="h-4 w-4"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function getEnumOptions(field: BooleanFieldConfig): { label: string; value: string }[] {
  if (field.enumOptions) {
    if (field.enumOptions.type === 'paired' && field.enumOptions.options.value) {
      return field.enumOptions.options.value.map((o) => ({ label: o.label, value: o.value }));
    }
    if (field.enumOptions.type === 'simple' && field.enumOptions.options.value) {
      return field.enumOptions.options.value.map((v) => ({ label: v, value: v }));
    }
  }
  return [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ];
}
