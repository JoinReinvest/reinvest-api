import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import expectThrowsAsync from "../expectThrowsAsync";

const CLIENT_ID = 'client_id',
    DEVELOPER_API_KEY = 'api_key',
    NORTH_CAPITAL_API_URL = 'https://api-sandboxdash.norcapsecurities.com';

describe('Creating ACH Plaid', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, NORTH_CAPITAL_API_URL)

    it('Invalid Developer Api Key response', async () => {
        const accountId = "P12345"
        const requester = new NorthCapitalRequester(CLIENT_ID, 'invalid_api_key', NORTH_CAPITAL_API_URL)

        await expectThrowsAsync(
            () => requester.linkExternalAchAccount(accountId),
            'Request error: [103] Invalid Developer Key/Client ID OR Developer Key not Active'
        );
    });

    it('Creating external account', async () => {
        const status = await requester.createExternalAchAccount(
            "123",
            "Test ReInvest",
            "ReTest",
            "BankName", // what bank is that? Is it investor bank or the bank where we send money?
            "123",
            "123",
            "10.0.0.115"
        );

        expect(status).is.false;
    });

    it('Linking external account', async () => {
        const accountId = "P12345" //  what account id is that? From createAccount or createExternalAccount? It seems that this is External Account
        const accountUrl = await requester.linkExternalAchAccount(accountId);

        expect(accountUrl).to.be('string');
    });
});