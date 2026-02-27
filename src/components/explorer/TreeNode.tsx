import { useState, useRef, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, FileText,
  MoreHorizontal, GripVertical,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import type { TreeNodeData, DragItem, DropTarget } from '@/types/project';

interface TreeNodeProps {
  node: TreeNodeData;
  isActive?: boolean;
  onContextMenu: (e: React.MouseEvent, node: TreeNodeData) => void;
  onOpen?: (formId: string) => void;
  onMenuClick: (e: React.MouseEvent, node: TreeNodeData) => void;
}

export function TreeNode({ node, isActive, onContextMenu, onOpen, onMenuClick }: TreeNodeProps) {
  const { expandedNodes, toggleNode } = useProjectStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedNodes.has(node.id);
  const isForm = node.kind === 'form';
  const isFolder = node.kind === 'folder';

  // Both folders and forms are draggable
  const dragItem: DragItem = {
    nodeId: node.id,
    kind: node.kind,
    name: node.name,
  };

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `drag-${node.id}`,
    data: dragItem,
  });

  // Only folders are drop targets
  const dropTarget: DropTarget | null = isFolder ? { nodeId: node.id } : null;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: dropTarget ?? undefined,
    disabled: !isFolder,
  });

  // Combine refs — forms get drag ref, folders get both
  const setRef = (el: HTMLElement | null) => {
    setDragRef(el);
    if (isFolder) setDropRef(el);
  };

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleDoubleClick = () => {
    setRenameValue(node.name);
    setIsRenaming(true);
  };

  const handleClick = () => {
    if (isForm) {
      if (onOpen && node.formId) onOpen(node.formId);
    } else {
      toggleNode(node.id);
    }
  };

  const commitRename = () => {
    setIsRenaming(false);
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === node.name) return;
    useProjectStore.getState().renameNode(node.id, trimmed);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsRenaming(false);
  };

  const Icon = isForm ? FileText : (isExpanded ? FolderOpen : Folder);
  const indent = node.depth * 16 + 4;

  return (
    <div
      ref={setRef}
      className={[
        'flex items-center gap-1 px-1 py-1 text-sm transition-colors group',
        'cursor-pointer',
        isActive ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'border-l-2 border-transparent',
        isOver ? 'bg-accent/50' : '',
        isDragging ? 'opacity-40' : '',
        'hover:bg-accent/30',
      ].join(' ')}
      style={{ paddingLeft: `${indent}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      {/* Drag handle / chevron */}
      {isForm ? (
        <span
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={12} />
        </span>
      ) : (
        <span
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-grab"
          {...attributes}
          {...listeners}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      )}

      <Icon size={14} className="flex-shrink-0 text-muted-foreground" />

      {isRenaming ? (
        <input
          ref={renameRef}
          className="flex-1 bg-transparent border border-ring rounded px-1 py-0 text-sm min-w-0 focus:outline-none"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
        />
      ) : (
        <span className="truncate flex-1 min-w-0">{node.name}</span>
      )}

      {/* "..." menu button */}
      <button
        className="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(e, node);
        }}
        title="Actions"
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}
