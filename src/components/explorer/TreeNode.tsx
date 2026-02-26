import { useState, useRef, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  ChevronRight, ChevronDown, Building2, Folder, FolderOpen, Tag, FileText,
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
  const isForm = node.type === 'form';
  const isDropTarget = !isForm;

  // Draggable for forms — listeners will be attached to drag handle only
  const dragItem: DragItem | null = isForm && node.formRef ? {
    type: 'form',
    formRef: node.formRef,
    sourceProjectId: node.projectId,
    sourceChildId: node.childId,
    sourceCategoryId: node.categoryId,
  } : null;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `drag-${node.id}`,
    data: dragItem ?? undefined,
    disabled: !isForm,
  });

  // Droppable for containers
  const dropTarget: DropTarget | null = isDropTarget ? {
    type: node.type as 'project' | 'child' | 'category',
    projectId: node.projectId,
    childId: node.childId,
    categoryId: node.categoryId,
  } : null;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: dropTarget ?? undefined,
    disabled: isForm,
  });

  // Combine refs
  const setRef = (el: HTMLElement | null) => {
    if (isForm) {
      setDragRef(el);
    } else {
      setDropRef(el);
    }
  };

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleDoubleClick = () => {
    if (!isForm) {
      setRenameValue(node.name);
      setIsRenaming(true);
    }
  };

  const handleClick = () => {
    if (isForm) {
      if (onOpen && node.formRef) onOpen(node.formRef.formId);
    } else {
      toggleNode(node.id);
    }
  };

  const commitRename = () => {
    setIsRenaming(false);
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === node.name) return;

    const store = useProjectStore.getState();
    switch (node.type) {
      case 'project':
        store.renameProject(node.projectId, trimmed);
        break;
      case 'child':
        if (node.childId) store.renameChildProject(node.projectId, node.childId, trimmed);
        break;
      case 'category':
        if (node.childId && node.categoryId)
          store.renameCategory(node.projectId, node.childId, node.categoryId, trimmed);
        break;
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsRenaming(false);
  };

  const Icon = (() => {
    switch (node.type) {
      case 'project': return Building2;
      case 'child': return isExpanded ? FolderOpen : Folder;
      case 'category': return Tag;
      case 'form': return FileText;
    }
  })();

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
      {/* Drag handle for forms */}
      {isForm ? (
        <span
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={12} />
        </span>
      ) : (
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
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
