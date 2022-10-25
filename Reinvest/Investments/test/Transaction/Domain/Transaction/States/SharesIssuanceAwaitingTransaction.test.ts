import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {DoNothing} from "../../../../../src/Transaction/Domain/Command/DoNothing";
import {SharesWereIssued} from "../../../../../src/Transaction/Domain/Events/SharesWereIssued";
import {
    SharesIssuanceAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/SharesIssuanceAwaitingTransaction";
import {ManualActionReason} from "../../../../../src/Transaction/Domain/ValueObject/ManualActionReason";
import {SharesIssuanceFailed} from "../../../../../src/Transaction/Domain/Events/SharesIssuanceFailed";
import {WaitForAdminManualAction} from "../../../../../src/Transaction/Domain/Command/WaitForAdminManualAction";
import {SharesId} from "../../../../../src/Commons/SharesId";

context('Given the trade was disbursed and awaiting for shares issuance', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new SharesIssuanceAwaitingTransaction(transactionId);

    describe('When the system issues shares', () => {
        const sharesId = new SharesId('1');
        const sharesWereIssued = new SharesWereIssued(transactionId, sharesId);

        it('Then the transaction should be successful', async () => {
            const decision: TransactionDecision = transaction.execute(sharesWereIssued);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithSuccess);
            expect(decision.stateChange.metadata.sharesId).is.equal(sharesId);
        });
    });

    describe('When the shares issuance fails', () => {
        const sharesIssuanceFailed = new SharesIssuanceFailed(transactionId);

        it('Then the system should wait for the admin manual action', async () => {
            const decision: TransactionDecision = transaction.execute(sharesIssuanceFailed);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.SharesIssuanceFailed);
        });
    });
});