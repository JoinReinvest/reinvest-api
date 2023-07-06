import type { TemplateContentType, TemplateStructureType } from 'Templates/Types';

export class TemplateParser {
  private static replace(str: string, data: TemplateContentType) {
    let copyStr = str;

    for (const property in data) {
      const key = `{(${property})}`;
      const val = data[property];

      if (val) {
        copyStr = copyStr.replaceAll(key, val);
      }
    }

    return copyStr;
  }

  private static prepareLines(lines: string[], data: TemplateContentType) {
    const replacedLines = lines.map(line => this.replace(line, data));

    return replacedLines;
  }

  static parse(template: TemplateStructureType, content: TemplateContentType): TemplateStructureType {
    return template.map(({ paragraphs, header }) => {
      let updatedHeader = undefined;
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(lines, content),
        };

        if (isCheckedOption !== undefined) {
          Object.assign(obj, { isCheckedOption });
        }

        return obj;
      });

      if (header) {
        updatedHeader = this.replace(header, content);
      }

      return { header: updatedHeader, paragraphs: updatedParagraphs };
    });
  }
}
