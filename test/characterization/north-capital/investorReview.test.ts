import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import ConfigurationCacheService from "../configurationCacheService";
import {NORTH_CAPITAL_CONFIG} from "../../../config";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL} = NORTH_CAPITAL_CONFIG;
const cacheService = new ConfigurationCacheService();

describe('Given investor', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)

    context('When I need to verify my investor', async () => {
        const partyId = cacheService.readValue('PARTY_ID');

        it('Then I should be able to perform basic KYC/AML verification', async () => {
            const verification = await requester.performBasicVerification(
                partyId
            );

            expect(verification.kyc).is.equal('Disapproved');
            expect(verification.aml).is.equal('Auto Approved');
        });
    });
});