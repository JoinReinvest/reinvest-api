import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import ConfigurationCacheService from "../configurationCacheService";
import {NORTH_CAPITAL_CONFIG} from "../../../config";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL} = NORTH_CAPITAL_CONFIG;
const cacheService = new ConfigurationCacheService();

describe('Given I am an individual person and I want to create an account in the North Capital', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)

    context('When I am a U.S. Citizen', () => {
        let accountId: string = cacheService.readValue('ACCOUNT_ID');
        let partyId: string = cacheService.readValue('PARTY_ID');
        let linkId: string = cacheService.readValue('PARTY_ACCOUNT_LINK_ID');

        it('Then I should be able to create an account for shares', async () => {
            accountId = await requester.createAccount(
                "Lukasz Duraj",
                "Individual",
                "domestic_account",
                "9215 W Wisconsine Ave",
                "Milwaukee",
                "Wisconsin",
                "WI 53226",
                "USA",
                "Manually Approved",
                "Manually Approved",
                "Self Accredited",
                "Approved"
            );

            expect(accountId).to.be.a('string');

            await cacheService.cacheValue('ACCOUNT_ID', accountId);
        });

        it('And Then I should be able to create a primary party on my own', async () => {
            partyId = await requester.createParty(
                "U.S. Citizen",
                "Lukasz",
                "Duraj",
                new Date("06-24-2000"),
                "9215 W Wisconsine Ave",
                "Milwaukee",
                "Wisconsin",
                "WI 53226",
                "USA",
                "reinvest@devkick.pl"
            );

            expect(partyId).to.be.a('string');

            await cacheService.cacheValue('PARTY_ID', partyId);
        });

        it('And Then I should be able to link the party to the account as a primary party', async () => {
            linkId = await requester.linkPartyToAccount(
                accountId,
                "IndivACParty",
                partyId,
                "owner",
                true
            );

            expect(linkId).to.be.a('string');

            await cacheService.cacheValue('PARTY_ACCOUNT_LINK_ID', linkId);
        });
    });
});
