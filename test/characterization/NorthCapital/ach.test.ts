import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import {NORTH_CAPITAL_CONFIG} from "../../../config";
import ConfigurationCacheService from "../ConfigurationCacheService";

const cacheService = new ConfigurationCacheService();
const {CLIENT_ID, DEVELOPER_API_KEY, API_URL} = NORTH_CAPITAL_CONFIG;

describe('Given I am individual with an account in North Capital', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)
    let accountId: string = cacheService.readValue('ACCOUNT_ID');

    context('When I want to start investing', () => {

        it('Then I need to be able to link external account with Plaid', async () => {
            const accountUrl = await requester.linkExternalAchAccount(accountId);

            expect(accountUrl).to.be.a('string');
            // after interaction on frontend we need a NickName of the bank!
            // Can we retrieve by API or FE will return it?
        });

        it.skip('Or Then I need to create my own integration with Plain ', async () => {
            const status = await requester.createExternalAchAccount(
                "123",
                "Test ReInvest",
                "ReTest",
                "BankName", // investor bank from Plaid
                "123",
                "123",
                "10.0.0.115"
            );

            expect(status).is.false;
        });
    });
});