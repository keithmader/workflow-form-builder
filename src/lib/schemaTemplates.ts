export interface SchemaTemplate {
  name: string;
  description: string;
  schema: string;
}

// Templates will be loaded from bundled example schemas
const templates: SchemaTemplate[] = [];

export function getTemplates(): SchemaTemplate[] {
  return templates;
}

export function addTemplate(template: SchemaTemplate): void {
  templates.push(template);
}

export function loadTemplatesFromJson(examples: Record<string, { name: string; description: string; json: string }>): void {
  for (const [, value] of Object.entries(examples)) {
    templates.push({
      name: value.name,
      description: value.description,
      schema: value.json,
    });
  }
}
