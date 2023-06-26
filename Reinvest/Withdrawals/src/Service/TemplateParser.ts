import { DictionaryType } from 'HKEKTypes/Generics';
import { Template } from 'Withdrawals/Domain/FundsWithdrawalRequest/types';

class TemplateParser {
  private template: Template;

  constructor(template: Template) {
    this.template = template;
  }

  private replace(str: string, data: DictionaryType) {
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

  private prepareLines(lines: string[], data: DictionaryType) {
    const replacedLines = lines.map(line => this.replace(line, data));

    return replacedLines;
  }

  parse(data: DictionaryType): Template {
    const template = this.template.map(({ paragraphs, header }) => {
      let updatedHeader = undefined;
      const updatedParagraphs = paragraphs.map(({ lines, isCheckedOption }) => {
        const obj = {
          lines: this.prepareLines(lines, data),
        };

        if (isCheckedOption !== undefined) {
          Object.assign(obj, { isCheckedOption });
        }

        return obj;
      });

      if (header) {
        updatedHeader = this.replace(header, data);
      }

      return { header: updatedHeader, paragraphs: updatedParagraphs };
    });

    return template;
  }
}

export default TemplateParser;
