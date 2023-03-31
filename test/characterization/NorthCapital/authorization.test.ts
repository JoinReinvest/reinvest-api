import { NORTH_CAPITAL_CONFIG } from '../../config';
import expectThrowsAsync from '../expectThrowsAsync';
import NorthCapitalRequester from './NorthCapitalRequester';

const { CLIENT_ID, API_URL } = NORTH_CAPITAL_CONFIG;

context('Given I am a developer', () => {
  describe('When I do not have a valid API developer key', () => {
    it('Then I should not be able to use the North Capital API', async () => {
      const accountId = 'P12345';
      const requester = new NorthCapitalRequester(CLIENT_ID, 'invalid_api_key', API_URL);

      await expectThrowsAsync(
        () => requester.linkExternalAchAccount(accountId),
        'Request error: [103] Invalid Developer Key/Client ID OR Developer Key not Active',
      );
    });
  });
});
