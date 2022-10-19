context('Feature: Investment process', () => {

    describe('Scenario: Initializing investment process', () => {
        require('./Transaction/Application/UseCases/InitializeTransaction.test.ts');
    });

    describe('Scenario: Investment process decisions step by step', () => {
        require('./Transaction/Domain/Transaction/States/1.InitializedTransaction.test');
        require('./Transaction/Domain/Transaction/States/2.TradeAwaitingTransaction.test');
        require('./Transaction/Domain/Transaction/States/3.FundsTransferAwaitingTransaction.test');
        require('./Transaction/Domain/Transaction/States/4.PaymentAwaitingTransaction.test');
        require('./Transaction/Domain/Transaction/States/5.CancellationPeriodEndAwaitingTransaction.test');
        require('./Transaction/Domain/Transaction/States/6.SharesIssuanceAwaitingTransaction.test');
    });

    describe('Scenario: Investment process decisions for extra actions', () => {
        require('./Transaction/Domain/Transaction/States/TradeUnwindAwaitingTransaction.test');
        require('./Transaction/Domain/Transaction/States/ManualActionAwaitingTransaction.test');
    });
});