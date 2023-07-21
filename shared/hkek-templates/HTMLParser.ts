import * as handlebars from 'handlebars';
import { HtmlTemplate, ParsedStructureType } from 'Templates/Types';

handlebars.registerHelper('bold_text', function (str) {
  return new handlebars.SafeString(str);
});

handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});

export class HTMLParser {
  private dataTemplate: ParsedStructureType;
  private htmlTemplate: HtmlTemplate;

  constructor(dataTemplate: ParsedStructureType, htmlTemplate: HtmlTemplate) {
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

  private getFormattedTemplate() {
    return this.dataTemplate.map(({ paragraphs, header, tableContent }) => {
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(<string[]>lines),
        };

        if (isCheckedOption !== undefined) {
          Object.assign(obj, { isCheckedOption });
        }

        return obj;
      });

      return { header, paragraphs: updatedParagraphs, tableContent };
    });
  }

  getHTML(): string {
    const formattedTemplate = this.getFormattedTemplate();

    return handlebars.compile(this.htmlTemplate)({ items: formattedTemplate });
  }
}
