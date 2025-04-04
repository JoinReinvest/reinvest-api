/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from "Templates/Types";

export type RedemptionFormDataType = {
  securityName: string;
  unitPrice: string;
  securityHolderName: string;
  securityHolderEmail: string;
  currentDistributionUnits: number;
  newDistributionUnits: number;
  dateOfRedemption: string;
};

export interface RedemptionFormContentFieldsV1 extends TemplateContentType {
  assetName: string;
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
          'We, the undersigned, authorize Vertalo, Inc. as the transfer agent of record for {{{(assetName)}}}, to redeem the following holdings.',
          'As of the date of this confirmations, we authorize Vertalo, Inc. to adjust the below-mentioned holdings',
        ],
      },
    ],
    // @ts-ignore
    tableContent: (content: RedemptionFormContentFieldsV1) => ({
      header: [
        'Security Name',
        'Unit Price',
        'Security holder Name',
        'Security holder Email',
        'Current Distribution Units',
        'New Distribution Units',
        'Date of Redemption',
      ],
      data: content.data.map(item => [
        item.securityName,
        item.unitPrice,
        item.securityHolderName,
        item.securityHolderEmail,
        item.currentDistributionUnits,
        item.newDistributionUnits,
        item.dateOfRedemption,
      ]),
    }),
  },
  {
    paragraphs: [
      {
        lines: [
          '{{Issuer Name}}: REINVEST Corp.',
          '{{Signature}}: ___________________________',
          '{{Authorized Representative Name}}: Brandon Rule',
          '{{Date}}: {(date)}',
        ],
      },
    ],
  },
];
