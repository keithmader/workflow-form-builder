import type { TextFieldConfig } from '@/types/schema';

interface TextInputProps {
  field: TextFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function TextInput({ field, value, onChange, disabled, error }: TextInputProps) {
  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.hint ?? undefined}
        disabled={disabled || field.isUneditable}
        className={`w-full px-3 py-2 rounded-md border text-sm bg-background ${
          error ? 'border-red-500' : 'border-border'
        } focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
