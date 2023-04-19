import { expect } from 'chai';

import { NORTH_CAPITAL_CONFIG } from '../../config';
import ConfigurationCacheService from '../ConfigurationCacheService';
import NorthCapitalRequester from './NorthCapitalRequester';

const { CLIENT_ID, DEVELOPER_API_KEY, API_URL } = NORTH_CAPITAL_CONFIG;
const cacheService = new ConfigurationCacheService();

context('Given I am an individual person and I want to create an account in the North Capital', () => {
  const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL);

  describe('When I am a U.S. Citizen', () => {
    let accountId: string = cacheService.readValue('ACCOUNT_ID');
    let partyId: string = cacheService.readValue('PARTY_ID');
    let linkId: string = cacheService.readValue('PARTY_ACCOUNT_LINK_ID');

    it('Then I should be able to create an account for shares', async () => {
      accountId = await requester.createAccount(
        'Lukasz Duraj',
        'Individual',
        'domestic_account',
        '9215 W Wisconsine Ave',
        'Milwaukee',
        'Wisconsin',
        'WI 53226',
        'USA',
        'Manually Approved',
        'Manually Approved',
        'Self Accredited',
        'Approved',
      );

      expect(accountId).to.be.a('string');

      await cacheService.cacheValue('ACCOUNT_ID', accountId);
    });

    it('And Then I should be able to create a primary party on my own', async () => {
      partyId = await requester.createParty(
        'U.S. Citizen',
        'Lukasz',
        'Duraj',
        new Date('06-24-2000'),
        '9215 W Wisconsine Ave',
        'Milwaukee',
        'Wisconsin',
        'WI 53226',
        'USA',
        'reinvest@devkick.pl',
      );

      expect(partyId).to.be.a('string');

      await cacheService.cacheValue('PARTY_ID', partyId);
    });

    it('And Then I should be able to link the party to the account as a primary party', async () => {
      linkId = await requester.linkPartyToAccount(accountId, 'IndivACParty', partyId, 'owner', true);

      expect(linkId).to.be.a('string');

      await cacheService.cacheValue('PARTY_ACCOUNT_LINK_ID', linkId);
    });

    it('And Then I should be able to get details of my account', async () => {
      const details = await requester.getAccountDetails(accountId);

      expect(details).to.be.an('object');
      expect(details.accountId).to.be.equal(accountId);
    });

    it('And Then I should be able to get all trades for my account', async () => {
      const trades = await requester.getAccountTrades(accountId);

      expect(trades).is.an('array');
      expect(trades).to.be.not.empty;
    });
  });

  describe('When I am an organization or trust', () => {
    let accountId: string = cacheService.readValue('COMPANY_ACCOUNT_ID');
    let partyId: string = cacheService.readValue('COMPANY_PARTY_ID');
    let entityId: string = cacheService.readValue('COMPANY_ENTITY_ID');
    let partyLinkId: string = cacheService.readValue('COMPANY_PARTY_ACCOUNT_LINK_ID');
    let entityLinkId: string = cacheService.readValue('COMPANY_ENTITY_ACCOUNT_LINK_ID');

    it('Then I should be able to create an account for shares', async () => {
      accountId = await requester.createAccount(
        'Lukasz Ltd.',
        'Entity',
        'domestic_account',
        '9215 W Wisconsine Ave',
        'Milwaukee',
        'Wisconsin',
        'WI 53226',
        'USA',
        'Manually Approved',
        'Manually Approved',
        'Self Accredited',
        'Approved',
      );

      expect(accountId).to.be.a('string');

      await cacheService.cacheValue('COMPANY_ACCOUNT_ID', accountId);
    });

    it('And Then I should be able to create a primary party on my own', async () => {
      partyId = await requester.createParty(
        'U.S. Citizen',
        'Lukasz',
        'Duraj',
        new Date('06-24-2000'),
        '9215 W Wisconsine Ave',
        'Milwaukee',
        'Wisconsin',
        'WI 53226',
        'USA',
        'reinvest@devkick.pl',
      );

      expect(partyId).to.be.a('string');

      await cacheService.cacheValue('COMPANY_PARTY_ID', partyId);
    });

    it('And Then I should be able to create an entity of my company', async () => {
      entityId = await requester.createEntity(
        'U.S. Citizen',
        'Lukasz LTD',
        'USA',
        '9215 W Wisconsine Ave',
        'Milwaukee',
        'Wisconsin',
        'WI 53226',
        'reinvest@devkick.pl',
        '10.0.0.1',
      );

      expect(entityId).to.be.a('string');

      await cacheService.cacheValue('COMPANY_ENTITY_ID', entityId);
    });

    it('And Then I should be able to link the party to the account as a primary party', async () => {
      partyLinkId = await requester.linkPartyToAccount(accountId, 'IndivACParty', partyId, 'owner', true);

      expect(partyLinkId).to.be.a('string');

      await cacheService.cacheValue('COMPANY_PARTY_ACCOUNT_LINK_ID', partyLinkId);
    });

    it('And Then I should be able to link the entity to the account', async () => {
      entityLinkId = await requester.linkPartyToAccount(accountId, 'EntityACParty', entityId, 'subsidiary', false);

      expect(entityLinkId).to.be.a('string');

      await cacheService.cacheValue('COMPANY_ENTITY_ACCOUNT_LINK_ID', entityLinkId);
    });
  });
});
