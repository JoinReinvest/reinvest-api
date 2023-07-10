import * as handlebars from 'handlebars';
import { HtmlTemplate, TemplateStructureType } from 'Templates/Types';

handlebars.registerHelper('bold_text', function (str) {
  return new handlebars.SafeString(str);
});

handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});

export class HTMLParser {
  private dataTemplate: TemplateStructureType;
  private htmlTemplate: HtmlTemplate;

  constructor(dataTemplate: TemplateStructureType, htmlTemplate: HtmlTemplate) {
    this.dataTemplate = dataTemplate;
    this.htmlTemplate = htmlTemplate;
  }

  private prepareLines(lines: string[]) {
    const replacedLines = lines.map(line => {
      if (line.indexOf('{{') !== -1 && line.indexOf('}}')) {
        return line.replaceAll('{{', '<b>').replaceAll('}}', '</b>');
      }

      return line;
    });

    return replacedLines;
  }

  private formatTemplate() {
    const formattedTemplate = this.dataTemplate.map(({ paragraphs, header }) => {
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(<string[]>lines),
        };

        if (isCheckedOption !== undefined) {
          Object.assign(obj, { isCheckedOption });
        }

        return obj;
      });

      return { header, paragraphs: updatedParagraphs };
    });

    return formattedTemplate;
  }

  getHTML(): string {
    const formattedTemplate = this.formatTemplate();

    return handlebars.compile(this.htmlTemplate)({ items: formattedTemplate });
  }
}
