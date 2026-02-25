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
  onNewFolder: (projectId: string) => void;
  onNewCategory: (projectId: string, childId: string) => void;
  onNewForm: (projectId: string, childId?: string, categoryId?: string) => void;
  onRename: (node: TreeNodeData) => void;
  onDelete: (node: TreeNodeData) => void;
  onOpen: (formId: string) => void;
  onDuplicate: (formId: string) => void;
}

export function ExplorerContextMenu({
  x, y, node, onClose,
  onNewFolder, onNewCategory, onNewForm,
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

  switch (node.type) {
    case 'project':
      actions.push({ label: 'New Folder', onClick: () => { onNewFolder(node.projectId); onClose(); } });
      actions.push({ label: 'New Form', onClick: () => { onNewForm(node.projectId); onClose(); } });
      actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
      actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
      break;
    case 'child':
      actions.push({ label: 'New Category', onClick: () => { onNewCategory(node.projectId, node.childId!); onClose(); } });
      actions.push({ label: 'New Form', onClick: () => { onNewForm(node.projectId, node.childId); onClose(); } });
      actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
      actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
      break;
    case 'category':
      actions.push({ label: 'New Form', onClick: () => { onNewForm(node.projectId, node.childId, node.categoryId); onClose(); } });
      actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
      actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
      break;
    case 'form':
      actions.push({ label: 'Edit', onClick: () => { onOpen(node.formRef!.formId); onClose(); } });
      actions.push({ label: 'Duplicate', onClick: () => { onDuplicate(node.formRef!.formId); onClose(); } });
      actions.push({ label: 'Rename', onClick: () => { onRename(node); onClose(); } });
      actions.push({ label: 'Delete', onClick: () => { onDelete(node); onClose(); }, destructive: true });
      break;
  }

  // Keep menu within viewport
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
