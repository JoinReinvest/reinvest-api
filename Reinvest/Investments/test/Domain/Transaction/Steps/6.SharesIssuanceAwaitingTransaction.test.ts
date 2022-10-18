import {expect} from "chai";

import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {DoNothing} from "../../../../src/Domain/Transaction/Command/DoNothing";
import {SharesWereIssued} from "../../../../src/Domain/Transaction/Events/SharesWereIssued";
import {
    SharesIssuanceAwaitingTransaction
} from "../../../../src/Domain/Transaction/States/SharesIssuanceAwaitingTransaction";
import {ManualActionReason} from "../../../../src/Domain/Transaction/ValueObject/ManualActionReason";
import {SharesIssuanceFailed} from "../../../../src/Domain/Transaction/Events/SharesIssuanceFailed";
import {WaitForAdminManualAction} from "../../../../src/Domain/Transaction/Command/WaitForAdminManualAction";
import {SharesId} from "../../../../src/Domain/Commons/SharesId";

context('Given the cancellation period ended and awaiting for shares issuance', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new SharesIssuanceAwaitingTransaction(transactionId);

    describe('When the share were issued', () => {
        const sharesId = new SharesId('1');
        const sharesWereIssued = new SharesWereIssued(transactionId, sharesId);

        it('Then the transaction should be successful', async () => {
            const decision: TransactionDecision = transaction.execute(sharesWereIssued);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithSuccess);
            expect(decision.stateChange.metadata.sharesId).is.equal(sharesId);
        });
    });

    describe('When the shares issuance failed', () => {
        const sharesIssuanceFailed = new SharesIssuanceFailed(transactionId);

        it('Then the system should wait for the admin manual action', async () => {
            const decision: TransactionDecision = transaction.execute(sharesIssuanceFailed);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.SharesIssuanceFailed);
        });
    });
});