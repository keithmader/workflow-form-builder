import { useState, useCallback } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Plus, FileText } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { TreeNode } from './TreeNode';
import { ExplorerContextMenu } from './ExplorerContextMenu';
import { PromptDialog, ConfirmDialog, UnsavedChangesDialog } from './ExplorerDialogs';
import type { TreeNodeData, DragItem, DropTarget } from '@/types/project';

type DialogState =
  | { type: 'none' }
  | { type: 'createProject' }
  | { type: 'createFolder'; projectId: string }
  | { type: 'createCategory'; projectId: string; childId: string }
  | { type: 'rename'; node: TreeNodeData }
  | { type: 'delete'; node: TreeNodeData }
  | { type: 'unsavedSwitch'; pendingFormId: string }
  | { type: 'unsavedNewForm'; projectId: string; childId?: string; categoryId?: string };

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNodeData;
}

export function ProjectExplorer() {
  const {
    projects, activeFormId, expandedNodes,
    createProject, createChildProject, createCategory,
    renameProject, renameChildProject, renameCategory, renameForm,
    deleteProject, deleteChildProject, deleteCategory, deleteForm,
    duplicateForm, saveForm, updateSavedForm, openForm, expandNode,
    moveForm,
  } = useProjectStore();

  const { isDirty, loadForm, getFormSnapshot } = useFormBuilderStore();

  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);

  // Build tree nodes
  const buildTreeNodes = useCallback((): TreeNodeData[] => {
    const nodes: TreeNodeData[] = [];

    for (const project of projects) {
      const projectNode: TreeNodeData = {
        type: 'project', id: project.id, name: project.name,
        projectId: project.id, depth: 0,
      };
      nodes.push(projectNode);

      if (!expandedNodes.has(project.id)) continue;

      // Child projects (folders)
      for (const child of project.children) {
        nodes.push({
          type: 'child', id: child.id, name: child.name,
          projectId: project.id, childId: child.id, depth: 1,
        });

        if (!expandedNodes.has(child.id)) continue;

        // Categories
        for (const cat of child.categories) {
          nodes.push({
            type: 'category', id: cat.id, name: cat.name,
            projectId: project.id, childId: child.id, categoryId: cat.id, depth: 2,
          });

          if (!expandedNodes.has(cat.id)) continue;

          // Forms in category
          for (const formRef of cat.formRefs) {
            nodes.push({
              type: 'form', id: formRef.id, name: formRef.name,
              projectId: project.id, childId: child.id, categoryId: cat.id,
              formRef, depth: 3,
            });
          }
        }

        // Uncategorized forms in child
        for (const formRef of child.uncategorizedForms) {
          nodes.push({
            type: 'form', id: formRef.id, name: formRef.name,
            projectId: project.id, childId: child.id,
            formRef, depth: 2,
          });
        }
      }

      // Uncategorized forms at project level
      for (const formRef of project.uncategorizedForms) {
        nodes.push({
          type: 'form', id: formRef.id, name: formRef.name,
          projectId: project.id,
          formRef, depth: 1,
        });
      }
    }

    return nodes;
  }, [projects, expandedNodes]);

  // Save current form (existing or new into first project)
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
      // No active form — save into first project or create one
      let projectId = projects[0]?.id;
      if (!projectId) {
        projectId = useProjectStore.getState().createProject('My Project');
      }
      saveForm(
        projectId,
        snapshot.formName || 'NewForm',
        snapshot.formTitle || 'New Form',
        snapshot.formDescription || '',
        snapshot.fields,
        snapshot.switchOperators,
        undefined,
        undefined,
        snapshot.rawSchema,
      );
    }
    useFormBuilderStore.setState({ isDirty: false });
  }, [activeFormId, getFormSnapshot, updateSavedForm, projects, saveForm]);

  const handleOpenForm = useCallback((formId: string) => {
    if (isDirty) {
      setDialog({ type: 'unsavedSwitch', pendingFormId: formId });
      return;
    }

    const form = openForm(formId);
    if (form) loadForm(form);
  }, [activeFormId, isDirty, openForm, loadForm]);

  const handleSaveAndSwitch = useCallback((pendingFormId: string) => {
    saveCurrent();
    const form = openForm(pendingFormId);
    if (form) loadForm(form);
    setDialog({ type: 'none' });
  }, [saveCurrent, openForm, loadForm]);

  const handleNewForm = useCallback((projectId: string, childId?: string, categoryId?: string) => {
    if (isDirty) {
      setDialog({ type: 'unsavedNewForm', projectId, childId, categoryId });
      return;
    }
    doCreateNewForm(projectId, childId, categoryId);
  }, [isDirty]);

  const doCreateNewForm = useCallback((projectId: string, childId?: string, categoryId?: string) => {
    // Reset to a blank form first
    useFormBuilderStore.getState().newForm();

    const snapshot = useFormBuilderStore.getState().getFormSnapshot();
    const formId = saveForm(
      projectId,
      snapshot.formName,
      snapshot.formTitle,
      snapshot.formDescription,
      snapshot.fields,
      snapshot.switchOperators,
      childId,
      categoryId,
    );

    // Expand parent nodes
    expandNode(projectId);
    if (childId) expandNode(childId);
    if (categoryId) expandNode(categoryId);

    // Load the new form
    const form = openForm(formId);
    if (form) loadForm(form);
  }, [saveForm, expandNode, openForm, loadForm]);

  const handleSaveAndNewForm = useCallback((projectId: string, childId?: string, categoryId?: string) => {
    saveCurrent();
    doCreateNewForm(projectId, childId, categoryId);
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
    switch (node.type) {
      case 'project':
        deleteProject(node.projectId);
        break;
      case 'child':
        if (node.childId) deleteChildProject(node.projectId, node.childId);
        break;
      case 'category':
        if (node.childId && node.categoryId)
          deleteCategory(node.projectId, node.childId, node.categoryId);
        break;
      case 'form':
        if (node.formRef) deleteForm(node.formRef.formId);
        break;
    }
    setDialog({ type: 'none' });
  }, [deleteProject, deleteChildProject, deleteCategory, deleteForm]);

  const handleRenameConfirm = useCallback((node: TreeNodeData, newName: string) => {
    switch (node.type) {
      case 'project':
        renameProject(node.projectId, newName);
        break;
      case 'child':
        if (node.childId) renameChildProject(node.projectId, node.childId, newName);
        break;
      case 'category':
        if (node.childId && node.categoryId)
          renameCategory(node.projectId, node.childId, node.categoryId, newName);
        break;
      case 'form':
        if (node.formRef) renameForm(node.formRef.formId, newName);
        break;
    }
    setDialog({ type: 'none' });
  }, [renameProject, renameChildProject, renameCategory, renameForm]);

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
    const dropData = over.data.current as DropTarget | undefined;
    if (!dragData || !dropData) return;

    moveForm(dragData, dropData);
  };

  const treeNodes = buildTreeNodes();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
        <button
          className="p-0.5 rounded hover:bg-accent transition-colors"
          onClick={() => setDialog({ type: 'createProject' })}
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
                    isActive={node.type === 'form' && node.formRef?.formId === activeFormId}
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
                  <FileText size={14} />
                  <span>{activeDrag.formRef.name}</span>
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
          onNewFolder={(projectId) => setDialog({ type: 'createFolder', projectId })}
          onNewCategory={(projectId, childId) => setDialog({ type: 'createCategory', projectId, childId })}
          onNewForm={handleNewForm}
          onRename={(node) => setDialog({ type: 'rename', node })}
          onDelete={(node) => setDialog({ type: 'delete', node })}
          onOpen={handleOpenForm}
          onDuplicate={(formId) => duplicateForm(formId)}
        />
      )}

      {/* Dialogs */}
      <PromptDialog
        open={dialog.type === 'createProject'}
        title="New Project"
        placeholder="Project name"
        onConfirm={(name) => { createProject(name); setDialog({ type: 'none' }); }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <PromptDialog
        open={dialog.type === 'createFolder'}
        title="New Folder"
        placeholder="Folder name (e.g. QA, UAT)"
        onConfirm={(name) => {
          if (dialog.type === 'createFolder') {
            const id = createChildProject(dialog.projectId, name);
            expandNode(dialog.projectId);
            expandNode(id);
          }
          setDialog({ type: 'none' });
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <PromptDialog
        open={dialog.type === 'createCategory'}
        title="New Category"
        placeholder="Category name"
        onConfirm={(name) => {
          if (dialog.type === 'createCategory') {
            const id = createCategory(dialog.projectId, dialog.childId, name);
            expandNode(dialog.childId);
            expandNode(id);
          }
          setDialog({ type: 'none' });
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <PromptDialog
        open={dialog.type === 'rename'}
        title={dialog.type === 'rename' ? `Rename ${dialog.node.type}` : ''}
        defaultValue={dialog.type === 'rename' ? dialog.node.name : ''}
        onConfirm={(name) => {
          if (dialog.type === 'rename') handleRenameConfirm(dialog.node, name);
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title={dialog.type === 'delete' ? `Delete ${dialog.node.type}?` : ''}
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
            handleSaveAndNewForm(dialog.projectId, dialog.childId, dialog.categoryId);
          }
        }}
        onCancel={() => setDialog({ type: 'none' })}
      />
    </div>
  );
}
