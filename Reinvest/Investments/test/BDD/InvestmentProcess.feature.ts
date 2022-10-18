context('Feature: Investment process', () => {

    describe('Scenario: Initializing investment process', () => {
        require('../TDD/Application/UseCases/InitializeTransaction.test.ts');
    });

    describe('Scenario: Investment process decisions step by step', () => {
        require('../TDD/Domain/Transaction/States/1.InitializedTransaction.test');
        require('../TDD/Domain/Transaction/States/2.TradeAwaitingTransaction.test');
        require('../TDD/Domain/Transaction/States/3.FundsTransferAwaitingTransaction.test');
        require('../TDD/Domain/Transaction/States/4.PaymentAwaitingTransaction.test');
        require('../TDD/Domain/Transaction/States/5.CancellationPeriodEndAwaitingTransaction.test');
        require('../TDD/Domain/Transaction/States/6.SharesIssuanceAwaitingTransaction.test');
    });

    describe('Scenario: Investment process decisions for extra actions', () => {
        require('../TDD/Domain/Transaction/States/TradeUnwindAwaitingTransaction.test');
        require('../TDD/Domain/Transaction/States/ManualActionAwaitingTransaction.test');
    });
});