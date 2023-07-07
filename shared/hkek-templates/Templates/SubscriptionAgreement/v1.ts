/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from "Templates/Types";

export interface SubscriptionAgreementContentFieldsV1 extends TemplateContentType {
  // portfolio
  nameOfAsset: string;
  nameOfOffering: string;
  offeringsCircularLink: string;
  tendererCompanyName: string;

  // legal entities
  purchaserName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  companyName: string;
  address: string;
  sensitiveNumber: string;

  isAccreditedInvestor: boolean;

  isFINRAMember: boolean;
  FINRAInstitutionName?: string;

  isTradedCompanyHolder: boolean;
  tickerSymbols?: string;

  // identity
  phoneNumber: string;
  email: string;

  // investments
  investedAmount: string;
  unitPrice: string;
  dateOfAgreement: string;
  ipAddress: string;
  signingTimestamp: string;
}

/**
 * @description
 * 1. {{}} - Content in double curly brackets will be bolded
 * 2. {(name)} - Content in parentheses will be replaced with the value of the field
 * 3. Fields required by the template are defined in the type SubscriptionAgreementContentFieldsV1 above
 */
export const subscriptionAgreementTemplateV1: TemplateStructureType = [
  {
    paragraphs: [
      {
        lines: ['{{Series {(nameOfAsset)}}}', '{{A series of {(nameOfOffering)}}}'],
      },
      {
        lines: ['Interests are offered through Dalmore Group, LLC, a registered broker-dealer and member of FINRA and SIPC ("Dalmore" or the "BOR").'],
      },
      {
        lines: ['Subscription Agreement to subscribe for Series {{{(nameOfAsset)}}}, a series of {{{(nameOfOffering)}}}'],
      },
    ],
  },
  {
    header: 'SUMMARY',
    paragraphs: [
      {
        lines: [
          '{{Legal name of Purchaser (Individual or Entity)}}: {(purchaserName)}',
          '{{Date of Agreement}}: {(dateOfAgreement)}',
          '{{Number of Series {(investedAmount)} Interests subscribed for}}: {(purchaserName)}',
          '{{Price of Series {(unitPrice)} Interests subscribed for}}: {(purchaserName)}',
          '{{Telephone Number}}: {(phoneNumber)}',
          '{{E-mail Address}}: {(email)}',
        ],
      },
      {
        lines: ['By clicking “I Agree” I, Purchaser, have executed this Subscription Agreement intended to be legally bound'],
      },
    ],
  },
  {
    header: 'IMPORTANT',
    paragraphs: [
      {
        lines: [
          'This Subscription Agreement and the Operating Agreement are legal agreements between you and {{{(tendererCompanyName)}}}\n' +
            '(company name) pertaining to your investment in {{{(nameOfAsset)}}} (series name). Your investment in membership interests\n' +
            'in {{{(investedAmount)}}} (the "Series (name) Interests") is contingent upon you accepting all of terms and conditions contained\n' +
            'in this Subscription Agreement and the Operating Agreement. The offering of the Series (name) Interests (the\n' +
            '"Offering") is described in the Offering Circular which is available at {{{(offeringsCircularLink)}}} and at the U.S. Securities and\n' +
            'Exchange Commission’s EDGAR website located at www.sec.gov. Please carefully read this Subscription Agreement,\n' +
            'the Operating Agreement and the Offering Circular before making an investment. This Subscription Agreement and\n' +
            'the Operating Agreement contain certain representations by you and set forth certain rights and obligations\n' +
            'pertaining to you, {{{(nameOfOffering)}}}, and your investment in {{{(nameOfAsset)}}}. The Offering Circular contains important\n' +
            'information about the Series {{{(nameOfAsset)}}} Interests and the terms and conditions of the Offering.',
          'By clicking "I AGREE" below, you:',
          'Acknowledge that you have read all of the terms and conditions contained in this Subscription Agreement, the\n' +
            'Operating Agreement and the Offering Circular, that you understand such terms and conditions, and that you\n' +
            'have had the opportunity to speak with a representative of {{{(nameOfOffering)}}} about a potential investment in the\n' +
            'Series {{{(nameOfAsset)}}} Interests;\n' +
            'Agree to the terms and conditions contained in this Subscription Agreement and theOperating Agreement; and\n' +
            'Execute this Subscription Agreement intending to be legally bound by the terms and conditions contained in\n' +
            'this Subscription Agreement and in the Operating Agreement.',
          'Do not click "I AGREE" unless you agree to all of the terms and conditions contained in this Subscription Agreement\n' +
            'and the Operating Agreement.',
        ],
      },
    ],
  },
  {
    header: 'INVESTOR QUALIFICATION AND ATTESTATION',
    paragraphs: [],
  },
  {
    header: 'INVESTOR INFORMATION',
    paragraphs: [
      {
        lines: [
          'First name: {{{(firstName)}}}',
          'Last name: {{{(lastName)}}}',
          'Date of Birth: {{{(dateOfBirth)}}}',
          'Entity Name(If Applicable): {{{(companyName)}}}',
          'Address: {{{(address)}}}',
          'Phone Number: {{{(phoneNumber)}}}',
          'E-mail Address: {{{(email)}}}',
          'Social Security # or Tax ID #: {{{(sensitiveNumber)}}}',
        ],
      },
    ],
  },
  {
    header: 'Check the applicable box:',
    paragraphs: [
      {
        lines: [
          '{{(a) I am an "accredited investor", and have checked the appropriate box on the attached Certificate of\n' +
            'Accredited Investor Status indicating the basis of such accredited investor status, which Certificate of\n' +
            'Accredited Investor Status is true and correct; or}}',
        ],
        // @ts-ignore
        isCheckedOption: (content: SubscriptionAgreementContentFieldsV1) => content.isAccreditedInvestor,
      },
      {
        lines: [
          '{{(b) The amount set forth on the first page of this Subscription Agreement, together with any previous\n' +
            'investments in securities pursuant to this offering, does not exceed 10% of the greater of my net worth or\n' +
            'annual income.}}',
        ],
        // @ts-ignore
        isCheckedOption: (content: SubscriptionAgreementContentFieldsV1) => !content.isAccreditedInvestor,
      },
      {
        lines: [
          'Are you or anyone in your immediate household, or, for any non-natural person, any officers, directors, or\n' +
            'any person that owns or controls 5% (or greater) of the quity, associated with a FINRA member, organization,\n' +
            'or the SEC',
          'If yes, please provide name of the FINRA institution below:',
          // @ts-ignore
          (content: SubscriptionAgreementContentFieldsV1) => (content.isFINRAMember ? `{{${content.FINRAInstitutionName!}}}` : null),
        ],
        // @ts-ignore
        isCheckedOption: (content: SubscriptionAgreementContentFieldsV1) => content.isFINRAMember,
      },
      {
        lines: [
          'Are you or anyone in your household or immediate family, or, for any non-natural person, any of its\n' +
            'directors, trustees, 10% (or more) equity holder, an officer, or member of the board of directors of a publicly traded company?',
          'If yes, please list ticker symbols of the publicly traded Company(s) below:',
          // @ts-ignore
          (content: SubscriptionAgreementContentFieldsV1) => (content.isTradedCompanyHolder ? `{{${content.tickerSymbols!}}}` : null),
        ],
        // @ts-ignore
        isCheckedOption: (content: SubscriptionAgreementContentFieldsV1) => content.isTradedCompanyHolder,
      },
    ],
  },
  {
    header: 'ATTESTATION',
    paragraphs: [
      {
        lines: [
          'I understand that an investment in private securities is very risky, that I may lose all of my invested capital\n' +
            'that it is an illiquid investment with no short term exit, and for which an ownership transfer is restricted.',
          '{{I UNDERSTAND}}',
        ],
      },
      {
        lines: [
          'The undersigned Purchaser acknowledges that the Company will be relying upon the information provided by\n' +
            'the Purchaser in this Questionnaire. If such representations shall cease to be true and accurate in any\n' +
            'respect, the undersigned shall give immediate notice of such fact to the Company.',
        ],
      },
    ],
  },

  // TODO CERTIFICATE OF ACCREDITED INVESTOR STATUS

  {
    header: 'SIGNATURE PAGE TO THE SUBSCRIPTION AGREEMENT',
    paragraphs: [
      {
        lines: [
          'SERIES {{{(nameOfAsset)}}} INTERESTS',
          'The Purchase hereby elects to subscribe under the Subscription Agreement for the number and price of the\n' +
            'Series {{{(nameOfAsset)}}} Interests stated on the front page of this Subscription Agreement.',
          'SIGNATURE: IN WITNESS WHEREOF, the Purchaser or its duly authorized representative electronically\n' +
            'executed and delivered this Subscription Agreement be clicking "I AGREE" below and acknowledges that all of\n' +
            'the information under the "SUMMARY" section above is true and correct.',
          'Accepted:',
          '{{{(nameOfOffering)}}}',
          'By: {{{(tendererCompanyName)}}}',
          'Name of Authorized Officer: {{{(firstName)} {(lastName)}}}',
          'Signature of Authorized Officer (IP,timestamp): {{{(ipAddress)},{(signingTimestamp)}}}',
          'Date: {{{(dateOfAgreement)}}}',
        ],
      },
    ],
  },
];
