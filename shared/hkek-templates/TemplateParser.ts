import type { TemplateContentType, TemplateStructureType } from 'Templates/Types';

export class TemplateParser {
  private static replace(str: string, data: TemplateContentType) {
    let copyStr = str;

    for (const property in data) {
      const key = `{(${property})}`;
      const val = data[property];
      // @ts-ignore
      copyStr = copyStr.replaceAll(key, val);
    }

    return copyStr;
  }

  private static prepareLines(lines: string[], data: TemplateContentType) {
    const replacedLines = lines.map(line => this.replace(line, data));

    return replacedLines;
  }

  private static resolveIsCheckedOption(isCheckedOption: boolean | ((content: TemplateContentType) => boolean), content: TemplateContentType) {
    if (typeof isCheckedOption === 'function') {
      return isCheckedOption(content);
    }

    return isCheckedOption;
  }

  static parse(template: TemplateStructureType, content: TemplateContentType): TemplateStructureType {
    return template.map(({ paragraphs, header }) => {
      let updatedHeader = undefined;
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(this.resolveLines(lines, content), content),
        };

        if (isCheckedOption !== undefined) {
          Object.assign(obj, { isCheckedOption: this.resolveIsCheckedOption(isCheckedOption, content) });
        }

        return obj;
      });

      if (header) {
        updatedHeader = this.replace(header, content);
      }

      return { header: updatedHeader, paragraphs: updatedParagraphs };
    });
  }

  private static resolveLines(lines: (string | ((content: TemplateContentType) => string | null))[], content: TemplateContentType): string[] {
    const resolvedLines = [];

    for (const line of lines) {
      if (typeof line === 'function') {
        const resolvedLine = line(content);

        if (resolvedLine) {
          resolvedLines.push(resolvedLine);
        }
      } else {
        resolvedLines.push(line);
      }
    }

    return resolvedLines;
  }
}
