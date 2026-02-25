import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project, ChildProject, Category, FormReference, SavedForm,
  DragItem, DropTarget,
} from '@/types/project';
import type { FieldConfig, ConditionalOperatorConfig } from '@/types/schema';

const STORAGE_KEY = 'workflow-form-builder-projects';
const FORMS_STORAGE_KEY = 'workflow-form-builder-saved-forms';

interface ProjectState {
  projects: Project[];
  savedForms: Record<string, SavedForm>;
  activeFormId: string | null;
  expandedNodes: Set<string>;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;

  // Project CRUD
  createProject: (name: string) => string;
  renameProject: (projectId: string, name: string) => void;
  deleteProject: (projectId: string) => void;

  // Child project CRUD
  createChildProject: (parentId: string, name: string) => string;
  renameChildProject: (parentId: string, childId: string, name: string) => void;
  deleteChildProject: (parentId: string, childId: string) => void;

  // Category CRUD
  createCategory: (projectId: string, childId: string, name: string) => string;
  renameCategory: (projectId: string, childId: string, categoryId: string, name: string) => void;
  deleteCategory: (projectId: string, childId: string, categoryId: string) => void;

  // Form management
  saveForm: (
    projectId: string,
    formName: string,
    formTitle: string,
    formDescription: string,
    fields: FieldConfig[],
    switchOperators: ConditionalOperatorConfig[],
    childId?: string,
    categoryId?: string,
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

  // Rename form reference
  renameForm: (formId: string, newName: string) => void;

  // Drag and drop
  moveForm: (dragItem: DragItem, dropTarget: DropTarget) => void;

  // UI state
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(state: ProjectState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    state.saveToStorage();
  }, 500);
}

// Helper to remove a form ref from anywhere in a project
function removeFormRefFromProject(project: Project, formId: string): Project {
  return {
    ...project,
    uncategorizedForms: project.uncategorizedForms.filter(f => f.formId !== formId),
    children: project.children.map(child => ({
      ...child,
      uncategorizedForms: child.uncategorizedForms.filter(f => f.formId !== formId),
      categories: child.categories.map(cat => ({
        ...cat,
        formRefs: cat.formRefs.filter(f => f.formId !== formId),
      })),
    })),
  };
}

// Helper to update form ref name everywhere
function updateFormRefName(project: Project, formId: string, newName: string): Project {
  const updateRef = (ref: FormReference) =>
    ref.formId === formId ? { ...ref, name: newName } : ref;
  return {
    ...project,
    uncategorizedForms: project.uncategorizedForms.map(updateRef),
    children: project.children.map(child => ({
      ...child,
      uncategorizedForms: child.uncategorizedForms.map(updateRef),
      categories: child.categories.map(cat => ({
        ...cat,
        formRefs: cat.formRefs.map(updateRef),
      })),
    })),
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  savedForms: {},
  activeFormId: null,
  expandedNodes: new Set<string>(),

  loadFromStorage: () => {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEY);
      const formsJson = localStorage.getItem(FORMS_STORAGE_KEY);
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const savedForms = formsJson ? JSON.parse(formsJson) : {};
      set({ projects, savedForms });
    } catch {
      // Corrupted data, start fresh
      set({ projects: [], savedForms: {} });
    }
  },

  saveToStorage: () => {
    const { projects, savedForms } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(savedForms));
    } catch {
      // localStorage full or unavailable
    }
  },

  createProject: (name) => {
    const id = uuidv4();
    const project: Project = { id, name, children: [], uncategorizedForms: [] };
    set(state => {
      const newState = { projects: [...state.projects, project] };
      debouncedSave({ ...state, ...newState } as ProjectState);
      return newState;
    });
    return id;
  },

  renameProject: (projectId, name) => {
    set(state => {
      const projects = state.projects.map(p =>
        p.id === projectId ? { ...p, name } : p
      );
      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
  },

  deleteProject: (projectId) => {
    set(state => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return state;

      // Collect all form IDs to delete
      const formIds = new Set<string>();
      project.uncategorizedForms.forEach(f => formIds.add(f.formId));
      project.children.forEach(child => {
        child.uncategorizedForms.forEach(f => formIds.add(f.formId));
        child.categories.forEach(cat => {
          cat.formRefs.forEach(f => formIds.add(f.formId));
        });
      });

      const savedForms = { ...state.savedForms };
      formIds.forEach(id => delete savedForms[id]);

      const projects = state.projects.filter(p => p.id !== projectId);
      const activeFormId = state.activeFormId && formIds.has(state.activeFormId)
        ? null : state.activeFormId;

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms, activeFormId };
    });
  },

  createChildProject: (parentId, name) => {
    const id = uuidv4();
    const child: ChildProject = { id, name, parentId, categories: [], uncategorizedForms: [] };
    set(state => {
      const projects = state.projects.map(p =>
        p.id === parentId ? { ...p, children: [...p.children, child] } : p
      );
      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
    return id;
  },

  renameChildProject: (parentId, childId, name) => {
    set(state => {
      const projects = state.projects.map(p =>
        p.id === parentId
          ? { ...p, children: p.children.map(c => c.id === childId ? { ...c, name } : c) }
          : p
      );
      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
  },

  deleteChildProject: (parentId, childId) => {
    set(state => {
      const project = state.projects.find(p => p.id === parentId);
      const child = project?.children.find(c => c.id === childId);
      if (!child) return state;

      const formIds = new Set<string>();
      child.uncategorizedForms.forEach(f => formIds.add(f.formId));
      child.categories.forEach(cat => cat.formRefs.forEach(f => formIds.add(f.formId)));

      const savedForms = { ...state.savedForms };
      formIds.forEach(id => delete savedForms[id]);

      const projects = state.projects.map(p =>
        p.id === parentId
          ? { ...p, children: p.children.filter(c => c.id !== childId) }
          : p
      );

      const activeFormId = state.activeFormId && formIds.has(state.activeFormId)
        ? null : state.activeFormId;

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms, activeFormId };
    });
  },

  createCategory: (projectId, childId, name) => {
    const id = uuidv4();
    const category: Category = { id, name, formRefs: [] };
    set(state => {
      const projects = state.projects.map(p =>
        p.id === projectId
          ? {
            ...p,
            children: p.children.map(c =>
              c.id === childId
                ? { ...c, categories: [...c.categories, category] }
                : c
            ),
          }
          : p
      );
      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
    return id;
  },

  renameCategory: (projectId, childId, categoryId, name) => {
    set(state => {
      const projects = state.projects.map(p =>
        p.id === projectId
          ? {
            ...p,
            children: p.children.map(c =>
              c.id === childId
                ? {
                  ...c,
                  categories: c.categories.map(cat =>
                    cat.id === categoryId ? { ...cat, name } : cat
                  ),
                }
                : c
            ),
          }
          : p
      );
      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
  },

  deleteCategory: (projectId, childId, categoryId) => {
    set(state => {
      const project = state.projects.find(p => p.id === projectId);
      const child = project?.children.find(c => c.id === childId);
      const category = child?.categories.find(cat => cat.id === categoryId);
      if (!category) return state;

      const formIds = new Set<string>();
      category.formRefs.forEach(f => formIds.add(f.formId));

      const savedForms = { ...state.savedForms };
      formIds.forEach(id => delete savedForms[id]);

      const projects = state.projects.map(p =>
        p.id === projectId
          ? {
            ...p,
            children: p.children.map(c =>
              c.id === childId
                ? { ...c, categories: c.categories.filter(cat => cat.id !== categoryId) }
                : c
            ),
          }
          : p
      );

      const activeFormId = state.activeFormId && formIds.has(state.activeFormId)
        ? null : state.activeFormId;

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms, activeFormId };
    });
  },

  saveForm: (projectId, formName, formTitle, formDescription, fields, switchOperators, childId, categoryId, rawSchema) => {
    const formId = uuidv4();
    const now = Date.now();

    const savedForm: SavedForm = {
      id: formId, formName, formTitle, formDescription,
      fields: JSON.parse(JSON.stringify(fields)),
      switchOperators: JSON.parse(JSON.stringify(switchOperators)),
      rawSchema: rawSchema ?? null,
      updatedAt: now,
    };

    const formRef: FormReference = { id: uuidv4(), formId, name: formName, updatedAt: now };

    set(state => {
      const savedForms = { ...state.savedForms, [formId]: savedForm };

      const projects = state.projects.map(p => {
        if (p.id !== projectId) return p;

        if (childId) {
          return {
            ...p,
            children: p.children.map(c => {
              if (c.id !== childId) return c;
              if (categoryId) {
                return {
                  ...c,
                  categories: c.categories.map(cat =>
                    cat.id === categoryId
                      ? { ...cat, formRefs: [...cat.formRefs, formRef] }
                      : cat
                  ),
                };
              }
              return { ...c, uncategorizedForms: [...c.uncategorizedForms, formRef] };
            }),
          };
        }

        return { ...p, uncategorizedForms: [...p.uncategorizedForms, formRef] };
      });

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms, activeFormId: formId };
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

      // Update form ref names
      const projects = state.projects.map(p => updateFormRefName(p, formId, formName));

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms };
    });
  },

  deleteForm: (formId) => {
    set(state => {
      const savedForms = { ...state.savedForms };
      delete savedForms[formId];

      const projects = state.projects.map(p => removeFormRefFromProject(p, formId));
      const activeFormId = state.activeFormId === formId ? null : state.activeFormId;

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms, activeFormId };
    });
  },

  duplicateForm: (formId) => {
    const state = get();
    const original = state.savedForms[formId];
    if (!original) return null;

    // Find where the original lives
    let targetProjectId: string | null = null;
    let targetChildId: string | undefined;
    let targetCategoryId: string | undefined;

    for (const project of state.projects) {
      if (project.uncategorizedForms.some(f => f.formId === formId)) {
        targetProjectId = project.id;
        break;
      }
      for (const child of project.children) {
        if (child.uncategorizedForms.some(f => f.formId === formId)) {
          targetProjectId = project.id;
          targetChildId = child.id;
          break;
        }
        for (const cat of child.categories) {
          if (cat.formRefs.some(f => f.formId === formId)) {
            targetProjectId = project.id;
            targetChildId = child.id;
            targetCategoryId = cat.id;
            break;
          }
        }
        if (targetProjectId) break;
      }
      if (targetProjectId) break;
    }

    if (!targetProjectId) return null;

    return get().saveForm(
      targetProjectId,
      original.formName + '_copy',
      original.formTitle + ' (Copy)',
      original.formDescription,
      original.fields,
      original.switchOperators,
      targetChildId,
      targetCategoryId,
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

  renameForm: (formId, newName) => {
    set(state => {
      const existing = state.savedForms[formId];
      if (!existing) return state;

      const savedForms = {
        ...state.savedForms,
        [formId]: { ...existing, formName: newName },
      };
      const projects = state.projects.map(p => updateFormRefName(p, formId, newName));

      debouncedSave({ ...state, projects, savedForms } as ProjectState);
      return { projects, savedForms };
    });
  },

  moveForm: (dragItem, dropTarget) => {
    set(state => {
      const formRef = dragItem.formRef;

      // Remove from source
      let projects = state.projects.map(p => removeFormRefFromProject(p, formRef.formId));

      // Add to target
      projects = projects.map(p => {
        if (p.id !== dropTarget.projectId) return p;

        if (dropTarget.childId) {
          return {
            ...p,
            children: p.children.map(c => {
              if (c.id !== dropTarget.childId) return c;
              if (dropTarget.categoryId) {
                return {
                  ...c,
                  categories: c.categories.map(cat =>
                    cat.id === dropTarget.categoryId
                      ? { ...cat, formRefs: [...cat.formRefs, formRef] }
                      : cat
                  ),
                };
              }
              return { ...c, uncategorizedForms: [...c.uncategorizedForms, formRef] };
            }),
          };
        }

        return { ...p, uncategorizedForms: [...p.uncategorizedForms, formRef] };
      });

      debouncedSave({ ...state, projects } as ProjectState);
      return { projects };
    });
  },

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
