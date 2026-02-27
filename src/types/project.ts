import type { FieldConfig, ConditionalOperatorConfig } from './schema';

// ── Recursive explorer model ──────────────────────────────────────────

export type NodeKind = 'folder' | 'form';

export interface ExplorerNode {
  id: string;
  kind: NodeKind;
  name: string;
  parentId: string | null;   // null = root level
  childIds: string[];         // ordered children (folders + forms interleaved)
  formId: string | null;      // points into savedForms when kind === 'form'
  updatedAt: number;
}

// Full form data stored in a flat record (unchanged from before)
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

// ── Drag and drop ─────────────────────────────────────────────────────

export interface DragItem {
  nodeId: string;
  kind: NodeKind;
  name: string;
}

export interface DropTarget {
  nodeId: string;
}

// ── Tree rendering ────────────────────────────────────────────────────

export interface TreeNodeData {
  id: string;
  kind: NodeKind;
  name: string;
  formId: string | null;
  depth: number;
}
