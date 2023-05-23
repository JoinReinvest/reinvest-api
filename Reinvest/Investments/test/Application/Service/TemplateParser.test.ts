import { expect } from 'chai';
import TemplateParser from 'Reinvest/Investments/src/Application/Service/TemplateParser';
context('Template parser', () => {
  const template = [
    {
      paragraphs: [
        {
          lines: ['{(name)}', '{(surname)}'],
        },
        {
          lines: ['Subscription Agreement to subscribe for Series {(series)}, a series of {(seriesOf)}'],
        },
      ],
    },
  ];
  const parser = new TemplateParser(template);

  describe('When TemplateParser parse template with given key/value object', () => {
    it('Should return lines with correctly parsed values', () => {
      const parsed = parser.parse({ name: 'New name', surname: 'New surname' });

      const firstLine = parsed[0]?.paragraphs[0]?.lines[0];
      const secondLine = parsed[0]?.paragraphs[0]?.lines[1];

      expect(firstLine).is.equal('New name');
      expect(secondLine).is.equal('New surname');
    });

    it('Should all paragraphs parsed correctly', () => {
      const parsed = parser.parse({ name: 'NewName', surname: 'NewSurname', series: 'A1234', seriesOf: 'B987' });

      const firstLinOfFirstParagraph = parsed[0]?.paragraphs[0]?.lines[0];
      const secondLineOfFirstParagraph = parsed[0]?.paragraphs[0]?.lines[1];
      const firstLineOfSecondParagraph = parsed[0]?.paragraphs[1]?.lines[0];

      expect(firstLinOfFirstParagraph).is.equal('NewName');
      expect(secondLineOfFirstParagraph).is.equal('NewSurname');
      expect(firstLineOfSecondParagraph).is.equal('Subscription Agreement to subscribe for Series A1234, a series of B987');
    });
  });
});
