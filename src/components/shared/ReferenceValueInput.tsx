import type { ReferenceValueConfig } from '@/types/schema';
import { useState } from 'react';

interface ReferenceValueInputProps<T> {
  label: string;
  value: ReferenceValueConfig<T> | null;
  onChange: (val: ReferenceValueConfig<T> | null) => void;
  parseValue: (s: string) => T | null;
  formatValue: (v: T) => string;
  placeholder?: string;
}

export function ReferenceValueInput<T>({
  label,
  value,
  onChange,
  parseValue,
  formatValue,
  placeholder,
}: ReferenceValueInputProps<T>) {
  const isRef = !!(value?.reference);
  const [mode, setMode] = useState<'value' | 'reference'>(isRef ? 'reference' : 'value');

  const handleModeToggle = () => {
    const newMode = mode === 'value' ? 'reference' : 'value';
    setMode(newMode);
    if (newMode === 'reference') {
      onChange({ value: null, reference: value?.reference ?? '' });
    } else {
      onChange({ value: value?.value ?? null, reference: null });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <button
          className="text-[10px] text-muted-foreground hover:text-foreground px-1"
          onClick={handleModeToggle}
          type="button"
        >
          {mode === 'value' ? '$ ref' : '# val'}
        </button>
      </div>
      {mode === 'value' ? (
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          value={value?.value != null ? formatValue(value.value) : ''}
          onChange={(e) => {
            const parsed = parseValue(e.target.value);
            onChange({ value: parsed, reference: null });
          }}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          value={value?.reference ?? ''}
          onChange={(e) => onChange({ value: null, reference: e.target.value })}
          placeholder="$this.fieldName"
        />
      )}
    </div>
  );
}

export function NumberRefInput({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: ReferenceValueConfig<number> | null;
  onChange: (v: ReferenceValueConfig<number> | null) => void;
  placeholder?: string;
}) {
  return (
    <ReferenceValueInput
      label={label}
      value={value}
      onChange={onChange}
      parseValue={(s) => { const n = Number(s); return isNaN(n) ? null : n; }}
      formatValue={(v) => String(v)}
      placeholder={placeholder}
    />
  );
}

export function BooleanRefInput({
  label, value, onChange,
}: {
  label: string;
  value: ReferenceValueConfig<boolean> | null;
  onChange: (v: ReferenceValueConfig<boolean> | null) => void;
}) {
  return (
    <ReferenceValueInput
      label={label}
      value={value}
      onChange={onChange}
      parseValue={(s) => s === 'true' ? true : s === 'false' ? false : null}
      formatValue={(v) => String(v)}
      placeholder="true / false"
    />
  );
}
