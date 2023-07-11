/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from "Templates/Types";

export interface RecurringSubscriptionAgreementContentFieldsV1 extends TemplateContentType {
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
  signingDate: string;

  // scheduled investments
  startDate: string;
  frequency: string;
}

export const recurringSubscriptionAgreementTemplateV1: TemplateStructureType = [
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
          '{{Number of Series {(nameOfAsset)} Interests subscribed for}}: {(investedAmount)}',
          '{{Telephone Number}}: {(phoneNumber)}',
          '{{E-mail Address}}: {(email)}',
        ],
      },
      {
        lines: ['{{I/We accept REINVEST to create scheduled investments as specified by us/me as follows:}}'],
      },
      {
        lines: ['Start date: {{{(startDate)}}}', 'Frequency: {{{(frequency)}}}', 'Amount: {{{(investedAmount)}}}', 'Share count: as per current NAV'],
      },
      {
        lines: ['{{By clicking “I Agree” I, Purchaser, have executed this Subscription Agreement intended to be legally bound}}'],
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
        isCheckedOption: (content: RecurringSubscriptionAgreementContentFieldsV1) => content.isAccreditedInvestor,
      },
      {
        lines: [
          '{{(b) The amount set forth on the first page of this Subscription Agreement, together with any previous\n' +
            'investments in securities pursuant to this offering, does not exceed 10% of the greater of my net worth or\n' +
            'annual income.}}',
        ],
        // @ts-ignore
        isCheckedOption: (content: RecurringSubscriptionAgreementContentFieldsV1) => !content.isAccreditedInvestor,
      },
      {
        lines: [
          'Are you or anyone in your immediate household, or, for any non-natural person, any officers, directors, or\n' +
            'any person that owns or controls 5% (or greater) of the quity, associated with a FINRA member, organization,\n' +
            'or the SEC',
          'If yes, please provide name of the FINRA institution below:',
          // @ts-ignore
          (content: RecurringSubscriptionAgreementContentFieldsV1) => (content.isFINRAMember ? `{{${content.FINRAInstitutionName!}}}` : null),
        ],
        // @ts-ignore
        isCheckedOption: (content: RecurringSubscriptionAgreementContentFieldsV1) => content.isFINRAMember,
      },
      {
        lines: [
          'Are you or anyone in your household or immediate family, or, for any non-natural person, any of its\n' +
            'directors, trustees, 10% (or more) equity holder, an officer, or member of the board of directors of a publicly traded company?',
          'If yes, please list ticker symbols of the publicly traded Company(s) below:',
          // @ts-ignore
          (content: RecurringSubscriptionAgreementContentFieldsV1) => (content.isTradedCompanyHolder ? `{{${content.tickerSymbols!}}}` : null),
        ],
        // @ts-ignore
        isCheckedOption: (content: RecurringSubscriptionAgreementContentFieldsV1) => content.isTradedCompanyHolder,
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
  {
    header: 'CERTIFICATE OF ACCREDITED INVESTOR STATUS',
    paragraphs: [
      {
        lines: [
          'The signatory hereto is an "accredited investor", as that term is defined in Regulation D under the Securities\n' +
            'Act of 1933, as amended (the "Act"). I have checked the box below indicating the basis on which I am\n' +
            'representing my status as an "accredited investor":',

          'A natural person whose net worth , either individually or jointly with that person’s spouse or a cohabitant of\n' +
            'that person and who occupies a relationship generally equivalent to that of a spouse, at the time of such\n' +
            'person’s purchase, exceeds $1,000,000;',

          'A natural person who had individual income in excess of $200,000, or joint income with that person’s spouse\n' +
            'or a cohabitant of that person and who occupies a relationship generally equivalent to that of a spouse in\n' +
            'excess of $300,000, in the previous two calendar years and reasonably expects to reach the same income\n' +
            'level in the current calendar year;',

          'A director, executive officer, or general partner of the Company, the Managing Member, the Asset Manager.;',

          'A bank as defined in section 3(a)(2) of the Act, or any savings and loan association or other institution as\n' +
            'defined in section 3(a)(5)(A) of the Act whether acting in its individual or fiduciary capacity; a broker or dealer\n' +
            'registered pursuant to section 15 of the Securities Exchange Act of 1934; a registered investment adviser\n' +
            'under Section 203 of the Investment Advisers Act of 1940 (the “Advisers Act”); a state-registered investment\n' +
            'adviser under the laws of the applicable jurisdiction; an investment adviser exempt from registration under\n' +
            'Section 203(l) of the Advisers Act; an investment adviser exempt from registration under Section 203(m) of\n' +
            'the Advisers Act; an insurance company as defined in section 2(a)(13) of the Act; an investment company\n' +
            'registered under the Investment Company Act of 1940 or a business development company as defined in\n' +
            'section 2(a)(48) of that Act; a Small Business Investment Company licensed by the U.S. Small Business\n' +
            'Administration under section 301(c) or (d) of the Small Business Investment Act of 1958; a rural business\n' +
            'investment company (RBIC), as defined in Section 384A of the Consolidated Farm and Rural Development Act\n' +
            'as a company that is approved by the Secretary of Agriculture and has entered into a participation\n' +
            'agreement with the Secretary; a plan established and maintained by a state, its political subdivisions, or anyagency or instrumentality of a state or its political subdivisions, for the benefit of its employees, if such plan\n' +
            'has total assets in excess of $5,000,000; an employee benefit plan within the meaning of the Employee\n' +
            'Retirement Income Security Act of 1974 if the investment decision is made by a plan fiduciary, as defined in\n' +
            'section 3(21) of such act, which is either a bank, savings and loan association, insurance company, or\n' +
            'registered investment adviser, or if the employee benefit plan has total assets in excess of $5,000,000 or, if a\n' +
            'self-directed plan, with investment decisions made solely by persons that are accredited investors;',

          'A private business development company as defined in section 202(a)(22) of the Advisers Act;',

          'An organization described in section 501(c)(3) of the Internal Revenue Code, corporation, limited liability\n' +
            'company, Massachusetts or similar business trust, or partnership, in each case not formed for the specific\n' +
            'purpose of acquiring the securities offered, with total assets in excess of $5,000,000;',

          'A trust, with total assets in excess of $5,000,000, not formed for the specific purpose of acquiring the\n' +
            'securities offered, whose purchase is directed by a sophisticated person as described in § 230.506(b)(2)(ii)\n' +
            'under the Act; or',

          'An entity, of a type not described in any of items 4 through 7 above or item 15 below, not formed for the\n' +
            'specific purpose of acquiring the securities offered, owning investments as defined in Rule 2a51-1(b) under\n' +
            'the ICA, in excess of $5,000,000;',

          'A natural person who holds in good standing of the General Securities Representative license (Series 7);',

          'A natural person who holds in good standing of the Investment Adviser Representative license (Series 65);',

          'A natural person who holds in good standing of the Private Securities Offerings Representative license (Series 82);',

          'A natural person who is a “knowledgeable employee” as defined in Rule 3c-5(a)(4) under the ICA, which\n' +
            'includes, among other persons, trustees and advisory board members (or persons serving in a similar\n' +
            'capacity) of a Section 3(c)(1) or 3(c)(7) fund under the ICA or an affiliated person of the fund that oversees the\n' +
            'fund’s investments, or an employee of the fund or the affiliated person of the fund (other than employees\n' +
            'performing solely clerical, secretarial or administrative functions) who, in connection with his or her regular\n' +
            'duties, has participated in the investment activities of the fund for at least 12 months;',

          'A “family office” as defined in Rule 202(a)(11)(G)-1 under the Advisers Act (i.e., an entity established by a\n' +
            'family to manage its assets, plan for its family’s financial future and provides other services to family\n' +
            'members) that meets following requirements: (i) having at least $5,000,000 in assets under management, (ii)not being formed for the specific purpose of acquiring the securities offered and (iii) having its prospective\n' +
            'investment be directed by a person or persons with knowledge and experience in financial and business\n' +
            'matters that such family office is capable of evaluating the merits and risks of the prospective investment;',

          'A “family client” as defined in Rule 202(a)(11)(G)-1 under the Advisers Act of a family office meeting the\n' +
            'requirements above in item (13) and whose prospective investment is directed by such family office;',

          'An entity in which all of the equity owners are accredited investors as described above.',
        ],
      },
    ],
  },
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
          // @ts-ignore
          (content: RecurringSubscriptionAgreementContentFieldsV1) =>
            content.ipAddress != ''
              ? 'Signature of Authorized Officer (IP,timestamp): {{{(ipAddress)},{(signingTimestamp)}}}'
              : 'Signature of Authorized Officer (IP,timestamp):',
          // @ts-ignore
          (content: RecurringSubscriptionAgreementContentFieldsV1) => (content.signingDate != '' ? 'Date: {{{(signingDate)}}}' : 'Date: '),
        ],
      },
    ],
  },
];
