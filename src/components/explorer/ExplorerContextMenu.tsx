import { useEffect, useRef } from 'react';
import type { TreeNodeData } from '@/types/project';

interface MenuAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  node: TreeNodeData;
  onClose: () => void;
  onNewFolder: (parentId: string) => void;
  onNewForm: (parentId: string) => void;
  onRename: (node: TreeNodeData) => void;
  onDelete: (node: TreeNodeData) => void;
  onOpen: (formId: string) => void;
  onDuplicate: (formId: string) => void;
}

export function ExplorerContextMenu({
  x, y, node, onClose,
  onNewFolder, onNewForm,
  onRename, onDelete, onOpen, onDuplicate,
}: ExplorerContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const actions: MenuAction[] = [];

  if (node.kind === 'folder') {
    actions.push({ label: 'New Subfolder', onClick: () => { onNewFolder(node.id); onClose(); } });
    actions.push({ label: 'New Form', onClick: () => { onNewForm(node.id); onClose(); } });
    actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
    actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
  } else {
    // form
    actions.push({ label: 'Edit', onClick: () => { if (node.formId) onOpen(node.formId); onClose(); } });
    actions.push({ label: 'Duplicate', onClick: () => { if (node.formId) onDuplicate(node.formId); onClose(); } });
    actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
    actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
  }

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 50,
  };

  return (
    <div ref={ref} style={menuStyle} className="bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]">
      {actions.map((action) => (
        <button
          key={action.label}
          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
            action.destructive ? 'text-destructive' : 'text-foreground'
          }`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
