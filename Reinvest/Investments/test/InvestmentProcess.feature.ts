context('Feature: Investment process', () => {

    describe('Scenario: Initializing investment process', () => {
        require('./Application/UseCases/InitializeTransaction.test.ts');
    });

    describe('Scenario: Investment process decisions step by step', () => {
        require('./Domain/Transaction/States/1.InitializedTransaction.test');
        require('./Domain/Transaction/States/2.TradeAwaitingTransaction.test');
        require('./Domain/Transaction/States/3.FundsTransferAwaitingTransaction.test');
        require('./Domain/Transaction/States/4.PaymentAwaitingTransaction.test');
        require('./Domain/Transaction/States/5.CancellationPeriodEndAwaitingTransaction.test');
        require('./Domain/Transaction/States/6.SharesIssuanceAwaitingTransaction.test');
    });

    describe('Scenario: Investment process decisions for extra actions', () => {
        require('./Domain/Transaction/States/TradeUnwindAwaitingTransaction.test');
        require('./Domain/Transaction/States/ManualActionAwaitingTransaction.test');
    });
});