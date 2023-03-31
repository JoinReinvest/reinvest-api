export type Template = {
  content: string;
  fields: string[];
  templateName: string;
};

export class TemplatesController {
  public static getClassName = (): string => 'TemplatesController';

  public async getTemplate(templateName: string): Promise<Template> {
    return {
      templateName: templateName,
      content: 'This is some template with {name} field',
      fields: ['name'],
    };
  }
}
