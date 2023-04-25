import { expect } from 'chai';

import { VERTALO_CONFIG } from '../../config';
import ConfigurationCacheService from '../ConfigurationCacheService';
import VertaloRequester from './VertaloRequester';

const { CLIENT_ID, CLIENT_SECRET, API_URL, ALLOCATION_ID } = VERTALO_CONFIG;
const cacheService = new ConfigurationCacheService();

describe('Execute issuer actions', () => {
  const vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);
  const distributionId = cacheService.readValue('VERTALO_DISTRIBUTION_ID');
  // const investorEmail = "bob3@test.com";
  const investorName = 'Bob';
  const investorEmail = 'bob3@test.com';
  before(async () => await vertaloRequester.preAuthorize());

  it('create investor', async () => {
    const { investorId, customerId } = await vertaloRequester.createInvestor(investorName, investorEmail);

    expect(investorId).to.be.a('string');
    expect(customerId).to.be.a('string');
  });

  it('create distribution', async () => {
    const { distributionId, status } = await vertaloRequester.createDistribution(ALLOCATION_ID, investorEmail, '164');

    expect(distributionId).to.be.a('string');
    expect(status).to.be.equal('drafted');

    await cacheService.cacheValue('VERTALO_DISTRIBUTION_ID', distributionId);
  });

  it('open distribution - awaiting for funding', async () => {
    const affected = await vertaloRequester.updateDistributionStatus(distributionId, 'open');

    expect(affected).to.be.true;
  });

  it('close distribution - funded', async () => {
    const affected = await vertaloRequester.updateDistributionStatus(distributionId, 'closed');

    expect(affected).to.be.true;
  });

  it('Mark distribution payment', async () => {
    const { paymentId, paidOn } = await vertaloRequester.markPayment(distributionId, '164');

    expect(paymentId).to.be.a('string');
    expect(paidOn).to.be.a('string');
  });

  it('Issue shares - create holding distribution', async () => {
    const holdingId = await vertaloRequester.issueShares(distributionId);

    expect(holdingId).to.be.a('string');
  });

  // it('create asset', async () => {
  //     assetId = await vertaloRequester.createAsset("Test Asset", "Preferred Equity", "500000", "Active");
  //
  //     expect(assetId).to.be.a("string")
  // })
  //
  // it('create round', async () => {
  //     roundId = await vertaloRequester.createRound(assetId, "Test Name", '2022-01-01', '2023-03-03', '500000', '1.00', 'Active', 'https://dataroom.example.com');
  //
  //     expect(roundId).to.be.a("string")
  // })
  //
  // it('create allocation', async () => {
  //     allocationId = await vertaloRequester.createAllocation(roundId, issuerId, "Dividend reinvestment", '2022-01-01', '2023-03-03');
  //
  //     expect(allocationId).to.be.a("string")
  // })
});
