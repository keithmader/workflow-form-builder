import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface PromptDialogProps {
  open: boolean;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({ open, title, defaultValue = '', placeholder, onConfirm, onCancel }: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg shadow-lg p-4 w-80 z-50">
          <Dialog.Title className="text-sm font-semibold mb-3">{title}</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <input
              className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring mb-3"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                disabled={!value.trim()}
              >
                OK
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', destructive = true, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg shadow-lg p-4 w-80 z-50">
          <Dialog.Title className="text-sm font-semibold mb-2">{title}</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">{message}</Dialog.Description>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                destructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface UnsavedChangesDialogProps {
  open: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({ open, onSave, onCancel }: UnsavedChangesDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg shadow-lg p-4 w-80 z-50">
          <Dialog.Title className="text-sm font-semibold mb-2">Unsaved Changes</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            You have changes that have not been saved.
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              onClick={onSave}
            >
              Save changes and continue
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
