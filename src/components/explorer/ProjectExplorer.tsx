import { useState, useCallback } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Plus, FileText, Folder } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { TreeNode } from './TreeNode';
import { ExplorerContextMenu } from './ExplorerContextMenu';
import { PromptDialog, ConfirmDialog, UnsavedChangesDialog } from './ExplorerDialogs';
import type { TreeNodeData, DragItem } from '@/types/project';

type DialogState =
  | { type: 'none' }
  | { type: 'createFolder'; parentId: string | null }
  | { type: 'createForm'; parentId: string }
  | { type: 'rename'; node: TreeNodeData }
  | { type: 'delete'; node: TreeNodeData }
  | { type: 'unsavedSwitch'; pendingFormId: string }
  | { type: 'unsavedNewForm'; parentId: string };

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNodeData;
}

export function ProjectExplorer() {
  const {
    nodes, rootIds, activeFormId, expandedNodes,
    createFolder, createFormNode, renameNode, deleteNode,
    duplicateForm, saveForm, updateSavedForm, openForm, expandNode,
    moveNode, setActiveFolderId,
  } = useProjectStore();

  const { isDirty, loadForm, getFormSnapshot } = useFormBuilderStore();

  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);

  // Build tree nodes recursively
  const buildTreeNodes = useCallback((): TreeNodeData[] => {
    const result: TreeNodeData[] = [];

    const walk = (ids: string[], depth: number) => {
      for (const id of ids) {
        const node = nodes[id];
        if (!node) continue;

        result.push({
          id: node.id,
          kind: node.kind,
          name: node.name,
          formId: node.formId,
          depth,
        });

        if (node.kind === 'folder' && expandedNodes.has(node.id)) {
          walk(node.childIds, depth + 1);
        }
      }
    };

    walk(rootIds, 0);
    return result;
  }, [nodes, rootIds, expandedNodes]);

  // Save current form
  const saveCurrent = useCallback(() => {
    const snapshot = getFormSnapshot();
    if (activeFormId) {
      updateSavedForm(
        activeFormId,
        snapshot.formName, snapshot.formTitle, snapshot.formDescription,
        snapshot.fields, snapshot.switchOperators,
        snapshot.rawSchema,
      );
    } else {
      // No active form — save into first root folder or create one
      let parentId: string | null = null;
      for (const id of rootIds) {
        if (nodes[id]?.kind === 'folder') { parentId = id; break; }
      }
      if (!parentId) {
        parentId = useProjectStore.getState().createFolder(null, 'My Project');
      }
      saveForm(
        parentId,
        snapshot.formName || 'NewForm',
        snapshot.formTitle || 'New Form',
        snapshot.formDescription || '',
        snapshot.fields,
        snapshot.switchOperators,
        snapshot.rawSchema,
      );
    }
    useFormBuilderStore.setState({ isDirty: false });
  }, [activeFormId, getFormSnapshot, updateSavedForm, rootIds, nodes, saveForm]);

  const handleOpenForm = useCallback((formId: string) => {
    if (isDirty) {
      setDialog({ type: 'unsavedSwitch', pendingFormId: formId });
      return;
    }
    const form = openForm(formId);
    if (form) loadForm(form);
  }, [isDirty, openForm, loadForm]);

  const handleSaveAndSwitch = useCallback((pendingFormId: string) => {
    saveCurrent();
    const form = openForm(pendingFormId);
    if (form) loadForm(form);
    setDialog({ type: 'none' });
  }, [saveCurrent, openForm, loadForm]);

  const handleNewForm = useCallback((parentId: string) => {
    if (isDirty) {
      setDialog({ type: 'unsavedNewForm', parentId });
      return;
    }
    doCreateNewForm(parentId);
  }, [isDirty]);

  const doCreateNewForm = useCallback((parentId: string) => {
    useFormBuilderStore.getState().newForm();

    const snapshot = useFormBuilderStore.getState().getFormSnapshot();
    const formId = saveForm(
      parentId,
      snapshot.formName,
      snapshot.formTitle,
      snapshot.formDescription,
      snapshot.fields,
      snapshot.switchOperators,
    );

    // Expand parent chain
    expandNode(parentId);
    const parentNode = nodes[parentId];
    if (parentNode?.parentId) expandNode(parentNode.parentId);

    const form = openForm(formId);
    if (form) loadForm(form);
  }, [saveForm, expandNode, openForm, loadForm, nodes]);

  const handleSaveAndNewForm = useCallback((parentId: string) => {
    saveCurrent();
    doCreateNewForm(parentId);
    setDialog({ type: 'none' });
  }, [saveCurrent, doCreateNewForm]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: TreeNodeData) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleMenuClick = useCallback((e: React.MouseEvent, node: TreeNodeData) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.right, y: rect.bottom, node });
  }, []);

  const handleDeleteNode = useCallback((node: TreeNodeData) => {
    deleteNode(node.id);
    setDialog({ type: 'none' });
  }, [deleteNode]);

  const handleRenameConfirm = useCallback((node: TreeNodeData, newName: string) => {
    renameNode(node.id, newName);
    setDialog({ type: 'none' });
  }, [renameNode]);

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragItem | undefined;
    if (data) setActiveDrag(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragItem | undefined;
    const dropData = over.data.current as { nodeId: string } | undefined;
    if (!dragData || !dropData) return;

    moveNode(dragData, dropData);
  };

  const treeNodes = buildTreeNodes();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
        <button
          className="p-0.5 rounded hover:bg-accent transition-colors"
          onClick={() => setDialog({ type: 'createFolder', parentId: null })}
          title="New Project"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tree */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="py-1">
              {treeNodes.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No projects yet. Click + to create one.
                </div>
              ) : (
                treeNodes.map(node => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    isActive={node.kind === 'form' && node.formId === activeFormId}
                    onContextMenu={handleContextMenu}
                    onOpen={handleOpenForm}
                    onMenuClick={handleMenuClick}
                  />
                ))
              )}
            </div>

            <DragOverlay>
              {activeDrag && (
                <div className="flex items-center gap-1 px-2 py-1 bg-popover border border-border rounded shadow-md text-sm">
                  {activeDrag.kind === 'folder' ? <Folder size={14} /> : <FileText size={14} />}
                  <span>{activeDrag.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-transparent transition-colors data-[orientation=vertical]:w-2"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-border rounded-full relative" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Context menu */}
      {contextMenu && (
        <ExplorerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onNewFolder={(parentId) => setDialog({ type: 'createFolder', parentId })}
          onNewForm={handleNewForm}
          onRename={(node) => setDialog({ type: 'rename', node })}
          onDelete={(node) => setDialog({ type: 'delete', node })}
          onOpen={handleOpenForm}
          onDuplicate={(formId) => duplicateForm(formId)}
        />
      )}

      {/* Dialogs */}
      <PromptDialog
        open={dialog.type === 'createFolder'}
        title={dialog.type === 'createFolder' && dialog.parentId === null ? 'New Project' : 'New Subfolder'}
        placeholder={dialog.type === 'createFolder' && dialog.parentId === null ? 'Project name' : 'Folder name'}
        onConfirm={(name) => {
          if (dialog.type === 'createFolder') {
            const id = createFolder(dialog.parentId, name);
            if (dialog.parentId) expandNode(dialog.parentId);
            expandNode(id);
          }
          setDialog({ type: 'none' });
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <PromptDialog
        open={dialog.type === 'rename'}
        title={dialog.type === 'rename' ? `Rename ${dialog.node.kind}` : ''}
        defaultValue={dialog.type === 'rename' ? dialog.node.name : ''}
        onConfirm={(name) => {
          if (dialog.type === 'rename') handleRenameConfirm(dialog.node, name);
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title={dialog.type === 'delete' ? `Delete ${dialog.node.kind}?` : ''}
        message={dialog.type === 'delete'
          ? `Are you sure you want to delete "${dialog.node.name}"? This cannot be undone.`
          : ''}
        onConfirm={() => {
          if (dialog.type === 'delete') handleDeleteNode(dialog.node);
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <UnsavedChangesDialog
        open={dialog.type === 'unsavedSwitch' || dialog.type === 'unsavedNewForm'}
        onSave={() => {
          if (dialog.type === 'unsavedSwitch') {
            handleSaveAndSwitch(dialog.pendingFormId);
          } else if (dialog.type === 'unsavedNewForm') {
            handleSaveAndNewForm(dialog.parentId);
          }
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />
    </div>
  );
}
