type Template = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

type DynamicType = { [key: string]: string };

class TemplateParser {
  private template: Template;

  constructor(template: Template) {
    this.template = template;
  }

  replace(str: string, data: DynamicType) {
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

  prepareLines(lines: string[], data: DynamicType) {
    const replacedLines = lines.map(line => this.replace(line, data));

    return {
      lines: replacedLines,
    };
  }

  parse(data: DynamicType): Template {
    const template = this.template.map(({ paragraphs }) => {
      const updatedParagraphs = paragraphs.map(({ lines }) => this.prepareLines(lines, data));

      return { paragraphs: updatedParagraphs };
    });

    return template;
  }
}

export default TemplateParser;
