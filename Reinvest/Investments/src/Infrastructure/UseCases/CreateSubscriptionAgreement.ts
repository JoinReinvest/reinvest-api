import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

import { AgreementTypes, SubscriptionAgreementStatus } from '../Adapters/PostgreSQL/InvestmentsTypes';
import { SubscriptionAgreementRepository } from '../Adapters/Repository/SubscriptionAgreementRepository';

const template = [
  {
    paragraphs: [
      {
        lines: ['{{Series A123}}', '{{A series of X7653}}'],
      },
      {
        lines: ['Interests are offered through Dalmore Group, LLC, a registered broker-dealer and member of FINRA and SIPC ("Dalmore" or the "BOR").'],
      },
      {
        lines: ['Subscription Agreement to subscribe for Series {{A123}}, a series of {{X7653}}'],
      },
    ],
  },
  {
    header: 'SUMMARY',
    paragraphs: [
      {
        lines: [
          '{{Legal name of Purchaser (Individual or Entity)}}: John Smith',
          '{{Date of Agreement}}: 03/24/2023',
          '{{Number of Series A123, Interests subscribed for}}: John Smith',
          '{{Price of Series A123 Interests subscribed for}}: John Smith',
          '{{Telephone Number}}: +17778887775',
          '{{E-mail Address}}: john.smith@gmail.com',
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
          'This Subscription Agreement and the Operating Agreement are legal agreements between you and ____________\n' +
            '(company name) pertaining to your investment in _________ (series name). Your investment in membership interests\n' +
            'in ____________ (the "Series (name) Interests") is contingent upon you accepting all of terms and conditions contained\n' +
            'in this Subscription Agreement and the Operating Agreement. The offering of the Series (name) Interests (the\n' +
            '"Offering") is described in the Offering Circular which is available at ___________ and at the U.S. Securities and\n' +
            'Exchange Commission’s EDGAR website located at www.sec.gov. Please carefully read this Subscription Agreement,\n' +
            'the Operating Agreement and the Offering Circular before making an investment. This Subscription Agreement and\n' +
            'the Operating Agreement contain certain representations by you and set forth certain rights and obligations\n' +
            'pertaining to you,_________________, and your investment in ___________. The Offering Circular contains important\n' +
            'information about the Series _____________ Interests and the terms and conditions of the Offering.',
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
        isCheckedOption: false,
      },
      {
        lines: [
          '{{(b) The amount set forth on the first page of this Subscription Agreement, together with any previous\n' +
            'investments in securities pursuant to this offering, does not exceed 10% of the greater of my net worth or\n' +
            'annual income.}}',
        ],
        isCheckedOption: true,
      },
      {
        lines: [
          'Are you or anyone in your immediate household, or, for any non-natural person, any officers, directors, or\n' +
            'any person that owns or controls 5% (or greater) of the quity, associated with a FINRA member, organization,\n' +
            'or the SEC',
          'NO',
        ],
      },
      {
        lines: [
          'Are you or anyone in your household or immediate family, or, for any non-natural person, any of its\n' +
            'directors, trustees, 10% (or more) equity holder, an officer, or member of the board of directors of a publicly traded company?',
          '{{YES}}',
          '{{Traded Company ticker symbols}}: RDW, TSLA, AAPL',
        ],
      },
    ],
  },
];

export type SubscriptionAgreementCreate = {
  accountId: string;
  agreementType: AgreementTypes;
  id: string;
  investmentId: string;
  profileId: string;
  status: SubscriptionAgreementStatus;
};

class CreateSubscriptionAgreement {
  static getClassName = (): string => 'CreateSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository, idGenerator: IdGeneratorInterface) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, investmentId: string) {
    const id = this.idGenerator.createUuid();

    const subscription: SubscriptionAgreementCreate = {
      id,
      accountId,
      profileId,
      investmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.DIRECT_DEPOSIT,
    };
    const status = await this.subscriptionAgreementRepository.create(subscription);

    if (!status) {
      return false;
    }

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, accountId, investmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    return {
      id: subscriptionAgreement.id,
      type: subscriptionAgreement.agreementType,
      status: subscriptionAgreement.status,
      createdAt: subscriptionAgreement.dateCreated,
      signedAt: subscriptionAgreement.signedAt,
      content: template,
    };
  }
}

export default CreateSubscriptionAgreement;
