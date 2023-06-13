import type { Template } from 'Documents/Port/Api/PdfController';
import { PdfTypes } from 'Documents/Port/Api/PdfController';
import * as handlebars from 'handlebars';

import agreementHTMLTemplate from './templates/AgreementTemplate';

handlebars.registerHelper('bold_text', function (str) {
  return new handlebars.SafeString(str);
});

handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});

class HTMLParser {
  private type: PdfTypes;
  private template: Template;

  constructor(type: PdfTypes, template: Template) {
    this.type = type;
    this.template = template;
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

  private getTemplate() {
    switch (this.type) {
      case PdfTypes.AGREEMENT: {
        return agreementHTMLTemplate;
      }
    }
  }

  private formatTemplate() {
    const formattedTemplate = this.template.map(({ paragraphs, header }) => {
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(lines),
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

  getHTML() {
    const formattedTemplate = this.formatTemplate();

    const template = this.getTemplate();

    return handlebars.compile(template)({ items: formattedTemplate });
  }
}

export default HTMLParser;
