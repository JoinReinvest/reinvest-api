import NorthCapitalRequester from "./NorthCapitalRequester";
import expectThrowsAsync from "../expectThrowsAsync";
import {NORTH_CAPITAL_CONFIG} from "../../../config";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL} = NORTH_CAPITAL_CONFIG;

describe('Given I am a developer', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)

    context('When I do not have a valid API developer key', () => {

        it('Then I should not be able to use the North Capital API', async () => {
            const accountId = "P12345"
            const requester = new NorthCapitalRequester(CLIENT_ID, 'invalid_api_key', API_URL)

            await expectThrowsAsync(
                () => requester.linkExternalAchAccount(accountId),
                'Request error: [103] Invalid Developer Key/Client ID OR Developer Key not Active'
            );
        });
    });
});