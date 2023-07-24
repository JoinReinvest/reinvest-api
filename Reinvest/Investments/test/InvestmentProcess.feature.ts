context('Feature: Investment process', () => {
  describe('Scenario: Initializing investment process', () => {
    require('./Transaction/Application/UseCases/InitializeTransaction.test');
  });

  describe('Scenario: Investment process decisions step by step', () => {
    require('./Domain/Transaction/States/InitializedTransaction.test');
    require('./Domain/Transaction/States/TradeAwaitingTransaction.test');
    require('./Domain/Transaction/States/SubscriptionAgreementAwaitingTransaction.test');
    require('./Domain/Transaction/States/FundsTransferAwaitingTransaction.test');
    require('./Domain/Transaction/States/PaymentAwaitingTransaction.test');
    require('./Domain/Transaction/States/VerificationAwaitingTransaction.test');
    require('./Domain/Transaction/States/DisbursementAwaitingTransaction.test');
    require('./Domain/Transaction/States/SharesIssuanceAwaitingTransaction.test');
  });

  describe('Scenario: Investment process decisions for extra actions', () => {
    require('./Domain/Transaction/States/TradeUnwindAwaitingTransaction.test');
    require('./Domain/Transaction/States/ManualActionAwaitingTransaction.test');
  });
});
