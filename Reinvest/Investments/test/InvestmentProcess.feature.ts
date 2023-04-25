context('Feature: Investment process', () => {
  describe('Scenario: Initializing investment process', () => {
    require('./Transaction/Application/UseCases/InitializeTransaction.test');
  });

  describe('Scenario: Investment process decisions step by step', () => {
    require('./Transaction/Domain/Transaction/States/InitializedTransaction.test');
    require('./Transaction/Domain/Transaction/States/TradeAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/SubscriptionAgreementAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/FundsTransferAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/PaymentAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/VerificationAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/DisbursementAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/SharesIssuanceAwaitingTransaction.test');
  });

  describe('Scenario: Investment process decisions for extra actions', () => {
    require('./Transaction/Domain/Transaction/States/TradeUnwindAwaitingTransaction.test');
    require('./Transaction/Domain/Transaction/States/ManualActionAwaitingTransaction.test');
  });
});
