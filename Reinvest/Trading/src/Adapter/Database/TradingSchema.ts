import { JSONObjectOf } from 'HKEKTypes/Generics';
import {
  DisbursementState,
  FundsMoveState,
  NorthCapitalTradeState,
  SharesTransferState,
  SubscriptionAgreementState,
  TradeConfiguration,
  VendorsConfiguration,
  VertaloDistributionState,
  VertaloPaymentState,
} from 'Trading/Domain/Trade';

export interface TradesTable {
  disbursementJson: JSONObjectOf<DisbursementState> | null;
  fundsMoveStateJson: JSONObjectOf<FundsMoveState> | null;
  investmentId: string;
  northCapitalTradeStateJson: JSONObjectOf<NorthCapitalTradeState> | null;
  sharesTransferJson: JSONObjectOf<SharesTransferState> | null;
  subscriptionAgreementStateJson: JSONObjectOf<SubscriptionAgreementState> | null;
  tradeConfigurationJson: JSONObjectOf<TradeConfiguration>;
  tradeId: string | null;
  vendorsConfigurationJson: JSONObjectOf<VendorsConfiguration> | null;
  vertaloDistributionStateJson: JSONObjectOf<VertaloDistributionState> | null;
  vertaloPaymentJson: JSONObjectOf<VertaloPaymentState> | null;
}
