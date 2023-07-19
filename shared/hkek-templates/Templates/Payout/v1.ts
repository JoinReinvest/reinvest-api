/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from 'Templates/Types';

export type PayoutDataType = {
  accountId: string;
  amount: string;
  northCapitalAccountNumber: string;
};

export interface PayoutContentFieldsV1 extends TemplateContentType {
  data: PayoutDataType[];
}

/**
 * @description
 * 1. {{}} - Content in double curly brackets will be bolded
 * 2. {(name)} - Content in parentheses will be replaced with the value of the field
 * 3. Fields required by the template are defined in the type SubscriptionAgreementContentFieldsV1 above
 */
export const payoutTemplateV1: TemplateStructureType<PayoutDataType> = [
  {
    // @ts-ignore
    tableContent: (content: PayoutContentFieldsV1) => content.data,
  },
];
