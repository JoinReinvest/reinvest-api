import { expect } from 'chai';

import { NORTH_CAPITAL_CONFIG } from '../../config';
import NorthCapitalRequester from './NorthCapitalRequester';

const { CLIENT_ID, DEVELOPER_API_KEY, API_URL, OFFERING_ID } = NORTH_CAPITAL_CONFIG;

context('Given I am an issuer and I am an admin', () => {
  const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL);

  describe('When I have created offer in the admin panel', () => {
    const offeringId = OFFERING_ID;

    it('Then I should be able to list all trades for the offering', async () => {
      const offeringPurchaseHistory = await requester.listOfferingPurchaseHistory(offeringId);

      expect(offeringPurchaseHistory).to.be.an('array');
      expect(offeringPurchaseHistory).to.not.be.empty;
    });

    it('Then I should be able to get the offering details', async () => {
      const details = await requester.getOfferingDetails(offeringId);

      expect(details).to.be.an('object');
      expect(details).to.has.keys('escrowAccountNumber', 'pendingAmount', 'fundedAmount', 'committedAmount');
    });

    it('Then I should be able to get the offering purchase details', async () => {
      const details = await requester.getOfferingPurchaseDetails(offeringId);

      expect(details).to.be.an('object');
    });

    it('Then I should be able to get the offering', async () => {
      const details = await requester.getOffering(offeringId);

      expect(details).to.be.an('object');
      expect(details).contains.keys('escrowAccountNumber', 'targetAmount', 'offeringStatus');
    });
  });
});
