import { expect } from 'chai';
import Profile from 'Reinvest/InvestmentAccounts/src/Domain/ProfileAggregate/Profile';
import { expectThrows } from 'test/characterization/expectThrowsAsync';

context('Given an investor has investment profile', () => {
  const profile = Profile.create('6da70730-e60b-4deb-bd94-de1bcc3ac160');
  profile.initialize();

  describe('When the investor wants to create individual account', async () => {
    const individualAccountId = 'e2cf35cb-2b32-4738-a739-97a646d11680';

    it('Then the investor should be able to open individual account', async () => {
      const listOfAccountTypesUserCanOpen = profile.listAccountTypesUserCanOpen();
      expect(listOfAccountTypesUserCanOpen).to.include('INDIVIDUAL');
    });

    it('Then if the investor does not have it, should be able to create it', async () => {
      const event = profile.openIndividualAccount(individualAccountId);
      expect(event.kind).to.be.equal('IndividualAccountOpened');
      expect(event.data.individualAccountId).to.be.equal(individualAccountId);
    });

    it('Then the investor should be not be able to open individual account any more', async () => {
      const listOfAccountTypesUserCanOpen = profile.listAccountTypesUserCanOpen();
      expect(listOfAccountTypesUserCanOpen).to.not.include('INDIVIDUAL');
    });

    it('But if the investor already created the individual account, Then it should throw an error', async () => {
      expectThrows(() => profile.openIndividualAccount(individualAccountId), 'THE_ACCOUNT_ALREADY_OPENED');
    });

    it('But if the investor already created an individual account, Then it should throw another error', async () => {
      expectThrows(() => profile.openIndividualAccount('17937420-eafb-4317-81a4-68fb4cb76192'), 'CANNOT_OPEN_ACCOUNT');
    });
  });
});
