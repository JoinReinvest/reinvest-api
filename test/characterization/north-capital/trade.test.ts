import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import ConfigurationCacheService from "../configurationCacheService";
import {NORTH_CAPITAL_CONFIG} from "../../../config";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL, OFFERING_ID} = NORTH_CAPITAL_CONFIG;
const cacheService = new ConfigurationCacheService();

describe('Given ' +
    'I have the North Capital account, ' +
    'primary party is linked, ' +
    'bank account is linked, ' +
    'offer is created, ' +
    'escrow account is created, ' +
    'escrow account is active', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)
    const offeringId = OFFERING_ID;
    let accountId: string = cacheService.readValue('ACCOUNT_ID');

    context('When I want to buy shares', async () => {
        const shares: string = '100';
        let tradeId: string = cacheService.readValue('TRADE_ID');


        it('Then I should be able to create a trade', async () => {
            tradeId = await requester.createTrade(
                offeringId,
                accountId,
                "ACH",
                shares,
                "10.0.0.1",
            );

            expect(tradeId).to.be.a('string');

            await cacheService.cacheValue('TRADE_ID', accountId);
        });

        it('And Then I should be able to transfer my funds to the escrow account', async () => {
            const transferReferenceNumber = await requester.moveFundsFromExternalAccounts(
                accountId,
                offeringId,
                tradeId,
                'ReTest',
                "1",
                "Test funds transfer",
                "10.0.0.1"
            );

            expect(transferReferenceNumber).to.be.a('string');

            await cacheService.cacheValue('FUNDS_TRANSFER_REF_NO', transferReferenceNumber);
        });
    });
});