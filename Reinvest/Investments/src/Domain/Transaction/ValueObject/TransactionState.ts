export enum TransactionState {
    Same,
    Initialized,
    TradeAwaiting,
    FundsTransferAwaiting,
    PaymentAwaiting,
    CancellationPeriodEndAwaiting,
    SharesIssuanceAwaiting,
    TradeUnwindAwaiting,
    ManualActionAwaiting,
    AdminManualActionAwaiting,
    CompletedWithFailure,
    CompletedWithSuccess,
}