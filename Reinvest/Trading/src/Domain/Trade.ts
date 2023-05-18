export type TradeConfiguration = {
  accountId: string;
  amount: number;
  bankAccountId: string;
  fees: number;
  investmentId: string;
  ip: string;
  portfolioId: string;
  profileId: string;
  subscriptionAgreementId: string;
};
export type VendorIdsConfiguration = {
  allocationId: string;
  bankAccountName: string;
  northCapitalAccountId: string;
  offeringId: string;
};
export type TradeSchema = {
  investmentId: string;
  tradeConfiguration: TradeConfiguration;
  vendorIds: VendorIdsConfiguration | null;
};

export class Trade {
  static create(trade: TradeSchema) {
    return new Trade();
  }
}
