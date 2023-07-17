import { UUID } from 'HKEKTypes/Generics';

export const MAX_EXTRA_TRANSFER_FEE_PERCENT = 0.06; // 6%

export type InvestmentFee = {
  amount: number;
  verificationFeeId: UUID;
};
