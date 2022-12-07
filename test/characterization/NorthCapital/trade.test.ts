import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import ConfigurationCacheService from "../ConfigurationCacheService";
import {NORTH_CAPITAL_CONFIG} from "../../config";
import expectThrowsAsync from "../expectThrowsAsync";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL, OFFERING_ID} = NORTH_CAPITAL_CONFIG;
const cacheService = new ConfigurationCacheService();

context('Given ' +
    'I have the North Capital account, ' +
    'primary party is linked, ' +
    'bank account is linked, ' +
    'offer is created, ' +
    'escrow account is created and active', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL);
    const offeringId = OFFERING_ID;
    let accountId: string = cacheService.readValue('ACCOUNT_ID');

    describe('When I want to buy shares', async () => {
        const shares: string = '3';
        let tradeId: string = cacheService.readValue('TRADE_ID');
        let fundsTransferRefNumber: string = cacheService.readValue('FUNDS_TRANSFER_REF_NO');


        it('Then I should be able to create a trade', async () => {
            tradeId = await requester.createTrade(
                offeringId,
                accountId,
                "ACH",
                shares,
                "10.0.0.1",
            );

            expect(tradeId).to.be.a('string');

            await cacheService.cacheValue('TRADE_ID', tradeId);
        });

        it('And Then I should be able to check the details of my trade', async () => {
            const tradeHistory = await requester.getTradeHistory(
                accountId,
                tradeId
            );
            expect(tradeHistory).to.be.an('array');
            expect(tradeHistory).to.not.be.empty;
            expect(tradeHistory[0]).contains.keys('totalAmount', 'totalShares', 'orderStatus');
        });

        it('And Then I should be able to transfer my funds to the escrow account', async () => {
            fundsTransferRefNumber = await requester.moveFundsFromExternalAccounts(
                accountId,
                offeringId,
                tradeId,
                'Plaid Checking - Wells Fargo',
                "6", // $1 for 100 shares of $0.01
                "Test funds transfer",
                "10.0.0.1"
            );

            expect(fundsTransferRefNumber).to.be.a('string');

            await cacheService.cacheValue('FUNDS_TRANSFER_REF_NO', fundsTransferRefNumber);
        });

        it('And Then I should NOT be able to transfer my funds with the same trade twice', async () => {
            const request = requester.moveFundsFromExternalAccounts(
                accountId,
                offeringId,
                tradeId,
                'Plaid Checking - Wells Fargo',
                "1",
                "Test funds transfer",
                "10.0.0.1"
            );

            await expectThrowsAsync(
                () => request,
                'Request error: [210] ACH request already sent this trade.'
            )
        });

        it('And Then I should be able to check the status of my payment', async () => {
            const status = await requester.getExternalFundMoveInfo(
                accountId,
                fundsTransferRefNumber
            );

            expect(status).is.equal('Pending');
        });

        it('And Then I should be able to check the details of my payment', async () => {
            const details = await requester.getExternalFundMoveDetails(
                accountId,
                fundsTransferRefNumber
            );

            expect(details).contains.keys('accountId', 'fundStatus', 'transactionstatus');
            expect(details.fundStatus).is.equal('Pending');
            expect(details.transactionstatus).is.equal('Pending');
        });

        it('And Then I should be able to get all ACH Pending transactions', async () => {
            const listOfTransactions = await requester.getAchPendingTransactionsForAccount(
                accountId
            );

            expect(listOfTransactions).is.an('array');
            expect(listOfTransactions).to.not.be.empty;
        });
    });
});