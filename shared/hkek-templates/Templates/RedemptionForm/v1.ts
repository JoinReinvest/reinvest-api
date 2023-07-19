/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from 'Templates/Types';

export type RedemptionFormDataType = {
  securityName: string;
  unitPrice: string;
  securityholderName: string;
  securityholderEmail: string;
  currentDistributionUnits: number;
  newDistributionUnits: number;
  dateOfRedemption: string;
};

export interface RedemptionFormContentFieldsV1 extends TemplateContentType {
  issuerName: string;
  signature: string;
  authorizedRepresentativeName: string;
  date: string;
  data: RedemptionFormDataType[];
}

/**
 * @description
 * 1. {{}} - Content in double curly brackets will be bolded
 * 2. {(name)} - Content in parentheses will be replaced with the value of the field
 * 3. Fields required by the template are defined in the type SubscriptionAgreementContentFieldsV1 above
 */
export const redemptionFormTemplateV1: TemplateStructureType<RedemptionFormDataType> = [
  {
    paragraphs: [
      {
        lines: [
          'We, the undersigned, authorize Vertalo, Inc. as the transfer agent of record for {(???)}, to redeem the followin holdings.',
          'As of the date of this confirmations, we authorize Vertalo, Inc. to adjust the below-mentioned holdings',
        ],
      },
    ],
    // @ts-ignore
    tableContent: (content: RedemptionFormContentFieldsV1) => content.data,
  },
  {
    paragraphs: [
      {
        lines: [
          '{{Issuer Name}}: {(issuerName)}',
          '{{Signature}}: {(signature)}',
          '{{Authorized Representative Name}}: {(authorizedRepresentativeName)}',
          '{{Date}}: {(date)}',
        ],
      },
    ],
  },
];
