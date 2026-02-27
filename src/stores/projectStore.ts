import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ExplorerNode, SavedForm, DragItem, DropTarget } from '@/types/project';
import type { FieldConfig, ConditionalOperatorConfig } from '@/types/schema';

const STORAGE_KEY = 'workflow-form-builder-projects';
const FORMS_STORAGE_KEY = 'workflow-form-builder-saved-forms';

// ── State shape ───────────────────────────────────────────────────────

interface ProjectState {
  nodes: Record<string, ExplorerNode>;
  rootIds: string[];
  savedForms: Record<string, SavedForm>;
  activeFormId: string | null;
  expandedNodes: Set<string>;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;

  // Generic CRUD
  createFolder: (parentId: string | null, name: string) => string;
  createFormNode: (parentId: string | null, name: string, formId: string) => string;
  renameNode: (nodeId: string, name: string) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (dragItem: DragItem, dropTarget: DropTarget) => void;

  // Form management
  saveForm: (
    parentId: string | null,
    formName: string,
    formTitle: string,
    formDescription: string,
    fields: FieldConfig[],
    switchOperators: ConditionalOperatorConfig[],
    rawSchema?: string | null,
  ) => string;
  updateSavedForm: (
    formId: string,
    formName: string,
    formTitle: string,
    formDescription: string,
    fields: FieldConfig[],
    switchOperators: ConditionalOperatorConfig[],
    rawSchema?: string | null,
  ) => void;
  deleteForm: (formId: string) => void;
  duplicateForm: (formId: string) => string | null;
  openForm: (formId: string) => SavedForm | null;
  setActiveFormId: (formId: string | null) => void;

  // Helpers
  getAncestorPath: (nodeId: string) => string[];
  findFormNode: (formId: string) => ExplorerNode | null;

  // UI state
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
}

// ── Debounced save ────────────────────────────────────────────────────

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(state: ProjectState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    state.saveToStorage();
  }, 500);
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Collect all descendant node IDs (inclusive) */
function collectSubtree(nodes: Record<string, ExplorerNode>, nodeId: string): string[] {
  const result: string[] = [nodeId];
  const node = nodes[nodeId];
  if (!node) return result;
  for (const childId of node.childIds) {
    result.push(...collectSubtree(nodes, childId));
  }
  return result;
}

/** Check if `candidateAncestor` is an ancestor of `nodeId` */
function isAncestor(nodes: Record<string, ExplorerNode>, candidateAncestor: string, nodeId: string): boolean {
  let current = nodes[nodeId];
  while (current) {
    if (current.parentId === candidateAncestor) return true;
    if (!current.parentId) return false;
    current = nodes[current.parentId];
  }
  return false;
}

// ── Migration from old format ─────────────────────────────────────────

interface OldFormReference { id: string; formId: string; name: string; updatedAt: number; }
interface OldCategory { id: string; name: string; formRefs: OldFormReference[]; }
interface OldChildProject { id: string; name: string; parentId: string; categories: OldCategory[]; uncategorizedForms: OldFormReference[]; }
interface OldProject { id: string; name: string; children: OldChildProject[]; uncategorizedForms: OldFormReference[]; }

function migrateOldFormat(oldProjects: OldProject[]): { nodes: Record<string, ExplorerNode>; rootIds: string[] } {
  const nodes: Record<string, ExplorerNode> = {};
  const rootIds: string[] = [];

  for (const project of oldProjects) {
    const projectNode: ExplorerNode = {
      id: project.id,
      kind: 'folder',
      name: project.name,
      parentId: null,
      childIds: [],
      formId: null,
      updatedAt: Date.now(),
    };
    rootIds.push(project.id);

    // Project-level uncategorized forms
    for (const ref of project.uncategorizedForms) {
      const formNode: ExplorerNode = {
        id: ref.id,
        kind: 'form',
        name: ref.name,
        parentId: project.id,
        childIds: [],
        formId: ref.formId,
        updatedAt: ref.updatedAt,
      };
      nodes[formNode.id] = formNode;
      projectNode.childIds.push(formNode.id);
    }

    // Children (folders)
    for (const child of project.children) {
      const childNode: ExplorerNode = {
        id: child.id,
        kind: 'folder',
        name: child.name,
        parentId: project.id,
        childIds: [],
        formId: null,
        updatedAt: Date.now(),
      };
      projectNode.childIds.push(child.id);

      // Child uncategorized forms
      for (const ref of child.uncategorizedForms) {
        const formNode: ExplorerNode = {
          id: ref.id,
          kind: 'form',
          name: ref.name,
          parentId: child.id,
          childIds: [],
          formId: ref.formId,
          updatedAt: ref.updatedAt,
        };
        nodes[formNode.id] = formNode;
        childNode.childIds.push(formNode.id);
      }

      // Categories become folders
      for (const cat of child.categories) {
        const catNode: ExplorerNode = {
          id: cat.id,
          kind: 'folder',
          name: cat.name,
          parentId: child.id,
          childIds: [],
          formId: null,
          updatedAt: Date.now(),
        };
        childNode.childIds.push(cat.id);

        for (const ref of cat.formRefs) {
          const formNode: ExplorerNode = {
            id: ref.id,
            kind: 'form',
            name: ref.name,
            parentId: cat.id,
            childIds: [],
            formId: ref.formId,
            updatedAt: ref.updatedAt,
          };
          nodes[formNode.id] = formNode;
          catNode.childIds.push(formNode.id);
        }

        nodes[catNode.id] = catNode;
      }

      nodes[childNode.id] = childNode;
    }

    nodes[projectNode.id] = projectNode;
  }

  return { nodes, rootIds };
}

function isOldFormat(data: unknown): data is OldProject[] {
  return Array.isArray(data) && data.length > 0 && 'children' in data[0];
}

function isNewFormat(data: unknown): data is { nodes: Record<string, ExplorerNode>; rootIds: string[] } {
  return !!data && typeof data === 'object' && 'nodes' in data && 'rootIds' in data;
}

// ── Store ─────────────────────────────────────────────────────────────

export const useProjectStore = create<ProjectState>((set, get) => ({
  nodes: {},
  rootIds: [],
  savedForms: {},
  activeFormId: null,
  expandedNodes: new Set<string>(),

  loadFromStorage: () => {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEY);
      const formsJson = localStorage.getItem(FORMS_STORAGE_KEY);
      const savedForms = formsJson ? JSON.parse(formsJson) : {};

      if (projectsJson) {
        const parsed = JSON.parse(projectsJson);
        if (isNewFormat(parsed)) {
          set({ nodes: parsed.nodes, rootIds: parsed.rootIds, savedForms });
        } else if (isOldFormat(parsed)) {
          const { nodes, rootIds } = migrateOldFormat(parsed);
          set({ nodes, rootIds, savedForms });
          // Persist migrated format immediately
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, rootIds }));
        } else {
          set({ nodes: {}, rootIds: [], savedForms });
        }
      } else {
        set({ nodes: {}, rootIds: [], savedForms });
      }
    } catch {
      set({ nodes: {}, rootIds: [], savedForms: {} });
    }
  },

  saveToStorage: () => {
    const { nodes, rootIds, savedForms } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, rootIds }));
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(savedForms));
    } catch {
      // localStorage full or unavailable
    }
  },

  // ── Generic CRUD ──────────────────────────────────────────────────

  createFolder: (parentId, name) => {
    const id = uuidv4();
    const node: ExplorerNode = {
      id, kind: 'folder', name, parentId,
      childIds: [], formId: null, updatedAt: Date.now(),
    };

    set(state => {
      const nodes = { ...state.nodes, [id]: node };
      let rootIds = state.rootIds;

      if (parentId && nodes[parentId]) {
        nodes[parentId] = { ...nodes[parentId], childIds: [...nodes[parentId].childIds, id] };
      } else if (!parentId) {
        rootIds = [...rootIds, id];
      }

      debouncedSave({ ...state, nodes, rootIds } as ProjectState);
      return { nodes, rootIds };
    });
    return id;
  },

  createFormNode: (parentId, name, formId) => {
    const id = uuidv4();
    const node: ExplorerNode = {
      id, kind: 'form', name, parentId,
      childIds: [], formId, updatedAt: Date.now(),
    };

    set(state => {
      const nodes = { ...state.nodes, [id]: node };
      let rootIds = state.rootIds;

      if (parentId && nodes[parentId]) {
        nodes[parentId] = { ...nodes[parentId], childIds: [...nodes[parentId].childIds, id] };
      } else if (!parentId) {
        rootIds = [...rootIds, id];
      }

      debouncedSave({ ...state, nodes, rootIds } as ProjectState);
      return { nodes, rootIds };
    });
    return id;
  },

  renameNode: (nodeId, name) => {
    set(state => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      const nodes = { ...state.nodes, [nodeId]: { ...node, name } };

      // If it's a form, also update the savedForm's formName
      if (node.kind === 'form' && node.formId) {
        const existing = state.savedForms[node.formId];
        if (existing) {
          const savedForms = { ...state.savedForms, [node.formId]: { ...existing, formName: name } };
          debouncedSave({ ...state, nodes, savedForms } as ProjectState);
          return { nodes, savedForms };
        }
      }

      debouncedSave({ ...state, nodes } as ProjectState);
      return { nodes };
    });
  },

  deleteNode: (nodeId) => {
    set(state => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      // Collect all nodes in subtree
      const subtreeIds = collectSubtree(state.nodes, nodeId);
      const nodes = { ...state.nodes };
      const savedForms = { ...state.savedForms };
      let activeFormId = state.activeFormId;

      // Delete associated savedForms and nodes
      for (const id of subtreeIds) {
        const n = nodes[id];
        if (n?.kind === 'form' && n.formId) {
          delete savedForms[n.formId];
          if (activeFormId === n.formId) activeFormId = null;
        }
        delete nodes[id];
      }

      // Remove from parent's childIds
      let rootIds = state.rootIds;
      if (node.parentId && nodes[node.parentId]) {
        nodes[node.parentId] = {
          ...nodes[node.parentId],
          childIds: nodes[node.parentId].childIds.filter(id => id !== nodeId),
        };
      } else {
        rootIds = rootIds.filter(id => id !== nodeId);
      }

      debouncedSave({ ...state, nodes, rootIds, savedForms } as ProjectState);
      return { nodes, rootIds, savedForms, activeFormId };
    });
  },

  moveNode: (dragItem, dropTarget) => {
    set(state => {
      const dragNode = state.nodes[dragItem.nodeId];
      const targetNode = state.nodes[dropTarget.nodeId];
      if (!dragNode || !targetNode) return state;

      // Can only drop into folders
      if (targetNode.kind !== 'folder') return state;

      // Cycle prevention: can't move a folder into its own subtree
      if (dragItem.nodeId === dropTarget.nodeId) return state;
      if (dragNode.kind === 'folder' && isAncestor(state.nodes, dragItem.nodeId, dropTarget.nodeId)) return state;

      // Already in the target? No-op
      if (dragNode.parentId === dropTarget.nodeId) return state;

      const nodes = { ...state.nodes };
      let rootIds = [...state.rootIds];

      // Remove from old parent
      if (dragNode.parentId && nodes[dragNode.parentId]) {
        nodes[dragNode.parentId] = {
          ...nodes[dragNode.parentId],
          childIds: nodes[dragNode.parentId].childIds.filter(id => id !== dragItem.nodeId),
        };
      } else {
        rootIds = rootIds.filter(id => id !== dragItem.nodeId);
      }

      // Add to new parent
      nodes[dropTarget.nodeId] = {
        ...nodes[dropTarget.nodeId],
        childIds: [...nodes[dropTarget.nodeId].childIds, dragItem.nodeId],
      };

      // Update the moved node's parentId
      nodes[dragItem.nodeId] = { ...nodes[dragItem.nodeId], parentId: dropTarget.nodeId };

      debouncedSave({ ...state, nodes, rootIds } as ProjectState);
      return { nodes, rootIds };
    });
  },

  // ── Form management ───────────────────────────────────────────────

  saveForm: (parentId, formName, formTitle, formDescription, fields, switchOperators, rawSchema) => {
    const formId = uuidv4();
    const now = Date.now();

    const savedForm: SavedForm = {
      id: formId, formName, formTitle, formDescription,
      fields: JSON.parse(JSON.stringify(fields)),
      switchOperators: JSON.parse(JSON.stringify(switchOperators)),
      rawSchema: rawSchema ?? null,
      updatedAt: now,
    };

    set(state => {
      const savedForms = { ...state.savedForms, [formId]: savedForm };

      // Create a form node in the tree
      const nodeId = uuidv4();
      const formNode: ExplorerNode = {
        id: nodeId, kind: 'form', name: formName,
        parentId, childIds: [], formId, updatedAt: now,
      };

      const nodes = { ...state.nodes, [nodeId]: formNode };
      let rootIds = state.rootIds;

      if (parentId && nodes[parentId]) {
        nodes[parentId] = { ...nodes[parentId], childIds: [...nodes[parentId].childIds, nodeId] };
      } else if (!parentId) {
        rootIds = [...rootIds, nodeId];
      }

      debouncedSave({ ...state, nodes, rootIds, savedForms } as ProjectState);
      return { nodes, rootIds, savedForms, activeFormId: formId };
    });

    return formId;
  },

  updateSavedForm: (formId, formName, formTitle, formDescription, fields, switchOperators, rawSchema) => {
    set(state => {
      const existing = state.savedForms[formId];
      if (!existing) return state;

      const now = Date.now();
      const savedForms = {
        ...state.savedForms,
        [formId]: {
          ...existing,
          formName, formTitle, formDescription,
          fields: JSON.parse(JSON.stringify(fields)),
          switchOperators: JSON.parse(JSON.stringify(switchOperators)),
          rawSchema: rawSchema ?? existing.rawSchema ?? null,
          updatedAt: now,
        },
      };

      // Update form node name in tree
      const nodes = { ...state.nodes };
      for (const key of Object.keys(nodes)) {
        if (nodes[key].kind === 'form' && nodes[key].formId === formId) {
          nodes[key] = { ...nodes[key], name: formName, updatedAt: now };
          break;
        }
      }

      debouncedSave({ ...state, nodes, savedForms } as ProjectState);
      return { nodes, savedForms };
    });
  },

  deleteForm: (formId) => {
    set(state => {
      const savedForms = { ...state.savedForms };
      delete savedForms[formId];

      // Find and remove the form node
      const nodes = { ...state.nodes };
      let rootIds = [...state.rootIds];
      let activeFormId = state.activeFormId === formId ? null : state.activeFormId;

      for (const key of Object.keys(nodes)) {
        const n = nodes[key];
        if (n.kind === 'form' && n.formId === formId) {
          // Remove from parent
          if (n.parentId && nodes[n.parentId]) {
            nodes[n.parentId] = {
              ...nodes[n.parentId],
              childIds: nodes[n.parentId].childIds.filter(id => id !== key),
            };
          } else {
            rootIds = rootIds.filter(id => id !== key);
          }
          delete nodes[key];
          break;
        }
      }

      debouncedSave({ ...state, nodes, rootIds, savedForms } as ProjectState);
      return { nodes, rootIds, savedForms, activeFormId };
    });
  },

  duplicateForm: (formId) => {
    const state = get();
    const original = state.savedForms[formId];
    if (!original) return null;

    // Find the form node to get its parentId
    const formNode = state.findFormNode(formId);
    const parentId = formNode?.parentId ?? null;

    return get().saveForm(
      parentId,
      original.formName + '_copy',
      original.formTitle + ' (Copy)',
      original.formDescription,
      original.fields,
      original.switchOperators,
      original.rawSchema,
    );
  },

  openForm: (formId) => {
    const state = get();
    const form = state.savedForms[formId];
    if (!form) return null;
    set({ activeFormId: formId });
    return form;
  },

  setActiveFormId: (formId) => set({ activeFormId: formId }),

  // ── Helpers ───────────────────────────────────────────────────────

  getAncestorPath: (nodeId) => {
    const { nodes } = get();
    const path: string[] = [];
    let current = nodes[nodeId];
    while (current) {
      path.unshift(current.name);
      if (!current.parentId) break;
      current = nodes[current.parentId];
    }
    return path;
  },

  findFormNode: (formId) => {
    const { nodes } = get();
    for (const key of Object.keys(nodes)) {
      if (nodes[key].kind === 'form' && nodes[key].formId === formId) {
        return nodes[key];
      }
    }
    return null;
  },

  // ── UI state ──────────────────────────────────────────────────────

  toggleNode: (nodeId) => {
    set(state => {
      const expanded = new Set(state.expandedNodes);
      if (expanded.has(nodeId)) {
        expanded.delete(nodeId);
      } else {
        expanded.add(nodeId);
      }
      return { expandedNodes: expanded };
    });
  },

  expandNode: (nodeId) => {
    set(state => {
      const expanded = new Set(state.expandedNodes);
      expanded.add(nodeId);
      return { expandedNodes: expanded };
    });
  },
}));
