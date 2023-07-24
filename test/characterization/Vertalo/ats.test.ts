import { expect } from 'chai';

import { VERTALO_CONFIG } from '../../config';
import VertaloRequester from './VertaloRequester';

const { CLIENT_ID, CLIENT_SECRET, API_URL } = VERTALO_CONFIG;

context('Given I am an admin', () => {
  const vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);

  before(async () => await vertaloRequester.preAuthorize());

  describe('When I want to transfer shares to an investor', async () => {
    it('Then I should be able to create an investor', async () => {
      const investorId = await vertaloRequester.createAtsInvestor('Bob', 'bob@test.com');

      expect(investorId).to.be('string');
    });
  });
});
