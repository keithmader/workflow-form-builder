import type { FieldConfig, ConditionalOperatorConfig } from './schema';

// Lightweight pointer stored in the tree
export interface FormReference {
  id: string;
  formId: string;
  name: string;
  updatedAt: number;
}

// Full form data stored in a flat record
export interface SavedForm {
  id: string;
  formName: string;
  formTitle: string;
  formDescription: string;
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  rawSchema: string | null;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  formRefs: FormReference[];
}

export interface ChildProject {
  id: string;
  name: string;
  parentId: string;
  categories: Category[];
  uncategorizedForms: FormReference[];
}

export interface Project {
  id: string;
  name: string;
  children: ChildProject[];
  uncategorizedForms: FormReference[];
}

// Drag and drop types
export type DragItemType = 'form';

export interface DragItem {
  type: DragItemType;
  formRef: FormReference;
  sourceProjectId: string;
  sourceChildId?: string;
  sourceCategoryId?: string;
}

export type DropTargetType = 'project' | 'child' | 'category';

export interface DropTarget {
  type: DropTargetType;
  projectId: string;
  childId?: string;
  categoryId?: string;
}

// Tree node types for rendering
export type TreeNodeType = 'project' | 'child' | 'category' | 'form';

export interface TreeNodeData {
  type: TreeNodeType;
  id: string;
  name: string;
  projectId: string;
  childId?: string;
  categoryId?: string;
  formRef?: FormReference;
  depth: number;
}
