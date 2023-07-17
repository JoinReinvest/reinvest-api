import { JSONObjectOf } from 'HKEKTypes/Generics';
import { ReinvestmentTradeConfiguration, ReinvestmentVendorsConfiguration } from 'Trading/Domain/ReinvestmentTrade';
import {
  CancelTradeState,
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
  cancelTradeJson: JSONObjectOf<CancelTradeState> | null;
  disbursementJson: JSONObjectOf<DisbursementState> | null;
  fundsMoveStateJson: JSONObjectOf<FundsMoveState> | null;
  investmentId: string;
  northCapitalTradeStateJson: JSONObjectOf<NorthCapitalTradeState> | null;
  retryPaymentStateJson: JSONObjectOf<FundsMoveState> | null;
  sharesTransferJson: JSONObjectOf<SharesTransferState> | null;
  subscriptionAgreementStateJson: JSONObjectOf<SubscriptionAgreementState> | null;
  tradeConfigurationJson: JSONObjectOf<TradeConfiguration>;
  tradeId: string | null;
  vendorsConfigurationJson: JSONObjectOf<VendorsConfiguration> | null;
  vertaloDistributionStateJson: JSONObjectOf<VertaloDistributionState> | null;
  vertaloPaymentJson: JSONObjectOf<VertaloPaymentState> | null;
}

export interface ReinvestmentTradesTable {
  dividendId: string;
  sharesTransferJson: JSONObjectOf<SharesTransferState> | null;
  tradeConfigurationJson: JSONObjectOf<ReinvestmentTradeConfiguration>;
  vendorsConfigurationJson: JSONObjectOf<ReinvestmentVendorsConfiguration> | null;
  vertaloDistributionStateJson: JSONObjectOf<VertaloDistributionState> | null;
  vertaloPaymentJson: JSONObjectOf<VertaloPaymentState> | null;
}
