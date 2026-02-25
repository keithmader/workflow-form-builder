import type { EnumOptionsConfig, PairedOptionConfig } from '@/types/schema';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface EnumOptionsEditorProps {
  value: EnumOptionsConfig | null;
  onChange: (val: EnumOptionsConfig | null) => void;
}

export function EnumOptionsEditor({ value, onChange }: EnumOptionsEditorProps) {
  const isPaired = value?.type === 'paired';
  const isRef = !!(value?.options?.reference);

  const simpleOptions: string[] = (!isPaired && !isRef && value?.type === 'simple')
    ? (value.options.value ?? [])
    : [];

  const pairedOptions: PairedOptionConfig[] = (isPaired && !isRef)
    ? ((value as { type: 'paired'; options: { value: PairedOptionConfig[] | null } }).options.value ?? [])
    : [];

  const togglePaired = () => {
    if (isPaired) {
      const opts = pairedOptions.map(p => p.label);
      onChange({ type: 'simple', options: { value: opts, reference: null } });
    } else {
      const opts = simpleOptions.map(s => ({ label: s, value: s }));
      onChange({ type: 'paired', options: { value: opts, reference: null } });
    }
  };

  const toggleRef = () => {
    if (isRef) {
      if (isPaired) {
        onChange({ type: 'paired', options: { value: [], reference: null } });
      } else {
        onChange({ type: 'simple', options: { value: [], reference: null } });
      }
    } else {
      if (isPaired) {
        onChange({ type: 'paired', options: { value: null, reference: '' } });
      } else {
        onChange({ type: 'simple', options: { value: null, reference: '' } });
      }
    }
  };

  if (isRef) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">Options (Reference)</label>
          <div className="flex gap-1">
            <button className="text-[10px] text-muted-foreground hover:text-foreground px-1" onClick={toggleRef}>
              # static
            </button>
          </div>
        </div>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          value={value?.options?.reference ?? ''}
          onChange={(e) => {
            if (isPaired) {
              onChange({ type: 'paired', options: { value: null, reference: e.target.value } });
            } else {
              onChange({ type: 'simple', options: { value: null, reference: e.target.value } });
            }
          }}
          placeholder="$task.external_data.options"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">Options</label>
        <div className="flex gap-1">
          <button className="text-[10px] text-muted-foreground hover:text-foreground px-1" onClick={togglePaired}>
            {isPaired ? 'simple' : 'paired'}
          </button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground px-1" onClick={toggleRef}>
            $ ref
          </button>
        </div>
      </div>

      {!isPaired ? (
        <div className="space-y-1">
          {simpleOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                className="flex-1 bg-transparent border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...simpleOptions];
                  newOpts[i] = e.target.value;
                  onChange({ type: 'simple', options: { value: newOpts, reference: null } });
                }}
              />
              <button
                className="p-0.5 text-destructive hover:bg-accent rounded"
                onClick={() => {
                  const newOpts = simpleOptions.filter((_, j) => j !== i);
                  onChange({ type: 'simple', options: { value: newOpts, reference: null } });
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onChange({ type: 'simple', options: { value: [...simpleOptions, `Option ${simpleOptions.length + 1}`], reference: null } });
            }}
          >
            <Plus size={12} /> Add option
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {pairedOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                className="flex-1 bg-transparent border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={opt.label}
                onChange={(e) => {
                  const newOpts = [...pairedOptions];
                  newOpts[i] = { ...newOpts[i], label: e.target.value };
                  onChange({ type: 'paired', options: { value: newOpts, reference: null } });
                }}
                placeholder="Label"
              />
              <input
                className="w-20 bg-transparent border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={opt.value}
                onChange={(e) => {
                  const newOpts = [...pairedOptions];
                  newOpts[i] = { ...newOpts[i], value: e.target.value };
                  onChange({ type: 'paired', options: { value: newOpts, reference: null } });
                }}
                placeholder="Value"
              />
              <button
                className="p-0.5 text-destructive hover:bg-accent rounded"
                onClick={() => {
                  const newOpts = pairedOptions.filter((_, j) => j !== i);
                  onChange({ type: 'paired', options: { value: newOpts, reference: null } });
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              const n = pairedOptions.length + 1;
              onChange({ type: 'paired', options: { value: [...pairedOptions, { label: `Option ${n}`, value: `opt${n}` }], reference: null } });
            }}
          >
            <Plus size={12} /> Add option
          </button>
        </div>
      )}
    </div>
  );
}
