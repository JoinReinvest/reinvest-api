import { HTMLParser } from 'Templates/HTMLParser';
import { TemplateCurrentVersions, TemplateMapping } from 'Templates/TemplateConfiguration';
import { TemplateParser } from 'Templates/TemplateParser';
import { HtmlTemplate, ParsedStructureType, TemplateContentType, Templates, TemplateStructureType, TemplateVersion } from 'Templates/Types';

export class Template {
  private template: Templates;
  private content: TemplateContentType;
  private version: TemplateVersion;

  constructor(template: Templates, content: TemplateContentType, templateVersion: TemplateVersion | null = null) {
    if (Object.values(Templates).indexOf(template) === -1) {
      throw new Error(`Template ${template} not found`);
    }

    if (templateVersion !== null && !this.doesVersionExist(template, templateVersion)) {
      throw new Error(`Template ${template} version ${templateVersion} not found`);
    }

    this.template = template;
    this.content = content;
    this.version = templateVersion ?? Template.getLatestTemplateVersion(template);
  }

  toArray(): ParsedStructureType {
    const template = this.getTemplate();

    return TemplateParser.parse(template, this.content);
  }

  toHtml() {
    const htmlParser = new HTMLParser(this.toArray(), this.getHtmlTemplate());

    return htmlParser.getHTML();
  }

  getVersion(): TemplateVersion {
    return this.version;
  }

  static getLatestTemplateVersion(templateType: Templates): TemplateVersion {
    return TemplateCurrentVersions[templateType];
  }

  private getTemplate(): TemplateStructureType {
    return TemplateMapping[this.template]![this.version]!.template!;
  }

  private doesVersionExist(templateType: Templates, templateVersion: TemplateVersion): boolean {
    return !!TemplateMapping[templateType][templateVersion];
  }

  private getHtmlTemplate(): HtmlTemplate {
    return TemplateMapping[this.template]![this.version]!.html!;
  }
}
