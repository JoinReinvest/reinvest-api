export type Template = {
    templateName: string,
    content: string,
    fields: string[]
}

export class TemplatesController {
    public static getClassName = (): string => "TemplatesController";

    public async getTemplate(templateName: string): Promise<Template> {
        return {
            templateName: templateName,
            content: "This is some template with {name} field",
            fields: ["name"]
        }
    }
}