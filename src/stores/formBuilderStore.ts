import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FieldConfig, FieldType, ConditionalOperatorConfig } from '@/types/schema';
import type { SavedForm } from '@/types/project';
import { createDefaultField } from '@/utils/fieldDefaults';
import { buildSchema, parseSchema } from '@/lib/builderBridge';

interface FormSnapshot {
  formName: string;
  formTitle: string;
  formDescription: string;
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  rawSchema: string | null;
}

interface FormBuilderState {
  formName: string;
  formTitle: string;
  formDescription: string;
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  rawSchema: string | null;
  formLoadCounter: number;
  selectedFieldId: string | null;
  isDirty: boolean;
  generatedSchema: string | null;

  // History for undo/redo
  history: { fields: FieldConfig[]; switchOperators: ConditionalOperatorConfig[] }[];
  historyIndex: number;

  // Actions
  setFormName: (name: string) => void;
  setFormTitle: (title: string) => void;
  setFormDescription: (desc: string) => void;
  selectField: (id: string | null) => void;
  addField: (type: FieldType, index?: number, parentId?: string) => void;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<FieldConfig>) => void;
  moveField: (fieldId: string, direction: 'up' | 'down', parentId?: string) => void;
  duplicateField: (fieldId: string) => void;
  setSwitchOperators: (operators: ConditionalOperatorConfig[]) => void;
  generateSchema: () => string | null;
  importSchema: (json: string) => boolean;
  newForm: () => void;
  undo: () => void;
  redo: () => void;

  // Project integration
  loadForm: (savedForm: SavedForm) => void;
  getFormSnapshot: () => FormSnapshot;
}

function pushHistory(state: FormBuilderState): Partial<FormBuilderState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({
    fields: JSON.parse(JSON.stringify(state.fields)),
    switchOperators: JSON.parse(JSON.stringify(state.switchOperators)),
  });
  return {
    history: newHistory.slice(-50), // keep last 50 states
    historyIndex: Math.min(newHistory.length - 1, 49),
    isDirty: true,
  };
}

function findFieldInList(fields: FieldConfig[], id: string): FieldConfig | null {
  for (const f of fields) {
    if (f.id === id) return f;
    if ('children' in f && f.children) {
      const found = findFieldInList(f.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateFieldInList(fields: FieldConfig[], id: string, updates: Partial<FieldConfig>): FieldConfig[] {
  return fields.map(f => {
    if (f.id === id) {
      return { ...f, ...updates } as FieldConfig;
    }
    if ('children' in f && f.children) {
      return { ...f, children: updateFieldInList(f.children, id, updates) } as FieldConfig;
    }
    return f;
  });
}

function removeFieldFromList(fields: FieldConfig[], id: string): FieldConfig[] {
  return fields
    .filter(f => f.id !== id)
    .map(f => {
      if ('children' in f && f.children) {
        return { ...f, children: removeFieldFromList(f.children, id) } as FieldConfig;
      }
      return f;
    });
}

function addFieldToParent(fields: FieldConfig[], parentId: string, newField: FieldConfig, index?: number): FieldConfig[] {
  return fields.map(f => {
    if (f.id === parentId && 'children' in f) {
      const children = [...(f.children ?? [])];
      if (index !== undefined) {
        children.splice(index, 0, newField);
      } else {
        children.push(newField);
      }
      return { ...f, children } as FieldConfig;
    }
    if ('children' in f && f.children) {
      return { ...f, children: addFieldToParent(f.children, parentId, newField, index) } as FieldConfig;
    }
    return f;
  });
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formName: 'NewForm',
  formTitle: 'New Form',
  formDescription: '',
  fields: [],
  switchOperators: [],
  rawSchema: null,
  formLoadCounter: 0,
  selectedFieldId: null,
  isDirty: false,
  generatedSchema: null,
  history: [{ fields: [], switchOperators: [] }],
  historyIndex: 0,

  setFormName: (name) => set({ formName: name, isDirty: true }),
  setFormTitle: (title) => set({ formTitle: title, isDirty: true }),
  setFormDescription: (desc) => set({ formDescription: desc, isDirty: true }),
  selectField: (id) => set({ selectedFieldId: id }),

  addField: (type, index, parentId) => {
    const state = get();
    const newField = createDefaultField(type);

    let newFields: FieldConfig[];
    if (parentId) {
      newFields = addFieldToParent(state.fields, parentId, newField, index);
    } else {
      newFields = [...state.fields];
      if (index !== undefined) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
    }

    set({
      fields: newFields,
      selectedFieldId: newField.id,
      ...pushHistory({ ...state, fields: newFields }),
    });
  },

  removeField: (fieldId) => {
    const state = get();
    const newFields = removeFieldFromList(state.fields, fieldId);
    set({
      fields: newFields,
      selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      ...pushHistory({ ...state, fields: newFields }),
    });
  },

  updateField: (fieldId, updates) => {
    const state = get();
    const newFields = updateFieldInList(state.fields, fieldId, updates);
    set({
      fields: newFields,
      ...pushHistory({ ...state, fields: newFields }),
    });
  },

  moveField: (fieldId, direction, parentId) => {
    const state = get();
    const moveInList = (fields: FieldConfig[]): FieldConfig[] => {
      const idx = fields.findIndex(f => f.id === fieldId);
      if (idx === -1) {
        return fields.map(f => {
          if ('children' in f && f.children) {
            return { ...f, children: moveInList(f.children) } as FieldConfig;
          }
          return f;
        });
      }
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= fields.length) return fields;
      const newFields = [...fields];
      [newFields[idx], newFields[newIdx]] = [newFields[newIdx], newFields[idx]];
      return newFields;
    };

    const newFields = moveInList(state.fields);
    set({
      fields: newFields,
      ...pushHistory({ ...state, fields: newFields }),
    });
  },

  duplicateField: (fieldId) => {
    const state = get();
    const deepClone = (field: FieldConfig): FieldConfig => {
      const cloned = JSON.parse(JSON.stringify(field)) as FieldConfig;
      cloned.id = uuidv4();
      cloned.widgetName = cloned.widgetName + '_copy';
      if ('children' in cloned && cloned.children) {
        cloned.children = cloned.children.map(deepClone);
      }
      return cloned;
    };

    const duplicateInList = (fields: FieldConfig[]): FieldConfig[] => {
      const idx = fields.findIndex(f => f.id === fieldId);
      if (idx !== -1) {
        const cloned = deepClone(fields[idx]);
        const newFields = [...fields];
        newFields.splice(idx + 1, 0, cloned);
        return newFields;
      }
      return fields.map(f => {
        if ('children' in f && f.children) {
          return { ...f, children: duplicateInList(f.children) } as FieldConfig;
        }
        return f;
      });
    };

    const newFields = duplicateInList(state.fields);
    set({
      fields: newFields,
      ...pushHistory({ ...state, fields: newFields }),
    });
  },

  setSwitchOperators: (operators) => {
    const state = get();
    set({
      switchOperators: operators,
      ...pushHistory({ ...state, switchOperators: operators }),
    });
  },

  generateSchema: () => {
    const state = get();
    const schema = buildSchema(state.fields, state.switchOperators);
    if (schema) {
      try {
        const formatted = JSON.stringify(JSON.parse(schema), null, 2);
        set({ generatedSchema: formatted });
        return formatted;
      } catch {
        set({ generatedSchema: schema });
        return schema;
      }
    }
    return null;
  },

  importSchema: (json) => {
    const result = parseSchema(json);
    if (!result) return false;
    const state = get();

    // Use parser-provided metadata, fall back to current state
    let formName = result.formName ?? state.formName;
    let formTitle = result.formTitle ?? state.formTitle;
    let formDescription = result.formDescription ?? state.formDescription;

    // If parser didn't provide metadata, try extracting from JSON top-level
    if (!result.formName && !result.formTitle) {
      try {
        const parsed = JSON.parse(json);
        if (parsed.title && typeof parsed.title === 'string') {
          formTitle = parsed.title;
          formName = parsed.title.replace(/[^a-zA-Z0-9]+(.)/g, (_: string, c: string) => c.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
        }
        if (parsed.description && typeof parsed.description === 'string') {
          formDescription = parsed.description;
        }
      } catch {
        // JSON already validated by caller, just skip metadata extraction
      }
    }

    set({
      formName,
      formTitle,
      formDescription,
      fields: result.fields,
      switchOperators: result.switchOperators,
      rawSchema: json,
      selectedFieldId: null,
      ...pushHistory({ ...state, fields: result.fields, switchOperators: result.switchOperators }),
    });
    return true;
  },

  newForm: () => {
    set({
      formName: 'NewForm',
      formTitle: 'New Form',
      formDescription: '',
      fields: [],
      switchOperators: [],
      rawSchema: null,
      selectedFieldId: null,
      isDirty: false,
      generatedSchema: null,
      history: [{ fields: [], switchOperators: [] }],
      historyIndex: 0,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const snapshot = state.history[newIndex];
    set({
      fields: JSON.parse(JSON.stringify(snapshot.fields)),
      switchOperators: JSON.parse(JSON.stringify(snapshot.switchOperators)),
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const snapshot = state.history[newIndex];
    set({
      fields: JSON.parse(JSON.stringify(snapshot.fields)),
      switchOperators: JSON.parse(JSON.stringify(snapshot.switchOperators)),
      historyIndex: newIndex,
    });
  },

  loadForm: (savedForm) => {
    let fields = JSON.parse(JSON.stringify(savedForm.fields));
    let switchOperators = JSON.parse(JSON.stringify(savedForm.switchOperators));
    let formName = savedForm.formName;
    let formTitle = savedForm.formTitle;
    let formDescription = savedForm.formDescription;

    // If fields are empty but rawSchema exists, try to parse fields from the JSON
    if ((!fields || fields.length === 0) && savedForm.rawSchema) {
      const parsed = parseSchema(savedForm.rawSchema);
      if (parsed) {
        fields = parsed.fields;
        switchOperators = parsed.switchOperators;
        // Use parser-provided metadata when available
        if (parsed.formTitle) formTitle = parsed.formTitle;
        if (parsed.formName && (!formName || formName === 'NewForm')) formName = parsed.formName;
        if (parsed.formDescription) formDescription = parsed.formDescription;
      }
    }

    const state = get();
    set({
      formName,
      formTitle,
      formDescription,
      fields,
      switchOperators,
      rawSchema: savedForm.rawSchema ?? null,
      formLoadCounter: state.formLoadCounter + 1,
      selectedFieldId: null,
      isDirty: false,
      generatedSchema: null,
      history: [{ fields: JSON.parse(JSON.stringify(fields)), switchOperators: JSON.parse(JSON.stringify(switchOperators)) }],
      historyIndex: 0,
    });
  },

  getFormSnapshot: () => {
    const state = get();
    return {
      formName: state.formName,
      formTitle: state.formTitle,
      formDescription: state.formDescription,
      fields: state.fields,
      switchOperators: state.switchOperators,
      rawSchema: state.rawSchema,
    };
  },
}));
