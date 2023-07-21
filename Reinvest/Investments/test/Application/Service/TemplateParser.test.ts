import { expect } from 'chai';
import { TemplateParser } from 'Templates/TemplateParser';
import { TemplateStructureType } from 'Templates/Types';

context('Template parser', () => {
  const template: TemplateStructureType = [
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

  describe('When TemplateParser parse subscriptionAgreementTemplate with given key/value object', () => {
    it('Should return lines with correctly parsed values', () => {
      const parsed = TemplateParser.parse(template, { name: 'New name', surname: 'New surname' });

      const firstLine = parsed[0]?.paragraphs[0]?.lines[0];
      const secondLine = parsed[0]?.paragraphs[0]?.lines[1];

      expect(firstLine).is.equal('New name');
      expect(secondLine).is.equal('New surname');
    });

    it('Should all paragraphs parsed correctly', () => {
      const parsed = TemplateParser.parse(template, {
        name: 'NewName',
        surname: 'NewSurname',
        series: 'A1234',
        seriesOf: 'B987',
      });

      const firstLinOfFirstParagraph = parsed[0]?.paragraphs[0]?.lines[0];
      const secondLineOfFirstParagraph = parsed[0]?.paragraphs[0]?.lines[1];
      const firstLineOfSecondParagraph = parsed[0]?.paragraphs[1]?.lines[0];

      expect(firstLinOfFirstParagraph).is.equal('NewName');
      expect(secondLineOfFirstParagraph).is.equal('NewSurname');
      expect(firstLineOfSecondParagraph).is.equal('Subscription Agreement to subscribe for Series A1234, a series of B987');
    });
  });
});
