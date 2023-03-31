import { expect } from 'chai';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import {
  DraftAccount,
  DraftAccountState,
  DraftAccountType,
  IndividualDraftAccount,
  IndividualDraftAccountSchema,
} from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { Avatar, AvatarInput } from 'Reinvest/LegalEntities/src/Domain/ValueObject/Document';
import { Employer, EmployerInput } from 'Reinvest/LegalEntities/src/Domain/ValueObject/Employer';
import { EmploymentStatus, EmploymentStatusEnum, EmploymentStatusInput } from 'Reinvest/LegalEntities/src/Domain/ValueObject/EmploymentStatus';
import { NetIncome, NetRangeInput, NetWorth } from 'Reinvest/LegalEntities/src/Domain/ValueObject/ValueRange';
import expectThrowsAsync, { expectThrows } from 'test/characterization/expectThrowsAsync';
import * as sinon from 'ts-sinon';

context('Given an investor has completed profile', () => {
  describe('When the investor wants to create the individual account', async () => {
    const draftAccountRepository = sinon.stubInterface<DraftAccountRepository>();
    const createDraftAccountUseCase = new CreateDraftAccount(draftAccountRepository);
    it('Then the investor creates a individual draft account', async () => {
      draftAccountRepository.getActiveDraftsOfType.returns([] as any);
      draftAccountRepository.storeDraft.returns(true as any);

      const draftId = await createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL);
      expect(draftId).to.be.not.empty;
      expect(draftId).to.be.a('string');
    });

    it('Or Then throw an error if the individual draft account already exist in Active state', async () => {
      draftAccountRepository.getActiveDraftsOfType.returns([{} as IndividualDraftAccount] as any);
      await expectThrowsAsync(() => createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL), 'Draft account already exist');
    });

    it("Or Then throw an error if it can't create a draft account", async () => {
      draftAccountRepository.getActiveDraftsOfType.returns([] as any);
      draftAccountRepository.storeDraft.returns(false as any);
      await expectThrowsAsync(() => createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL), 'Cannot create draft account');
    });

    // it("Then complete the name", async () => {
    //     const inputName = {
    //         firstName: 'Firstname',
    //         lastName: 'Lastname',
    //         middleName: 'Middlename'
    //     };
    //     profile.setName(PersonalName.create(inputName))
    //     const profileOutput = profile.toObject();
    //     const name = profileOutput.name as PersonalNameInput;
    //
    //     expect(name.firstName).to.be.equal(inputName.firstName);
    //     expect(name.lastName).to.be.equal(inputName.lastName);
    //     expect(name.middleName).to.be.equal(inputName.middleName);
    // });
  });
});

context('Given an investor created an individual draft account', () => {
  const draftId = 'f962e397-ab99-4b64-af98-4084a2294152';
  const profileId = '9a97b97e-8bfe-4572-8bbf-b335896b0b14';
  describe('When the investor wants to complete draft', async () => {
    const draftAccount = DraftAccount.create({
      profileId,
      draftId,
      accountType: DraftAccountType.INDIVIDUAL,
      state: DraftAccountState.ACTIVE,
      data: {} as IndividualDraftAccountSchema,
    }) as IndividualDraftAccount;

    const verifyIndividualDraftAccount = (expectedResult: boolean) => {
      expect(draftAccount.verifyCompletion()).to.be.equal(expectedResult);
    };

    it('Then verify the draft account and should not be completed yet', async () => {
      verifyIndividualDraftAccount(false);
    });

    it('Then the investor provides employment status', async () => {
      const input = <EmploymentStatusInput>{
        status: EmploymentStatusEnum.EMPLOYED,
      };

      draftAccount.setEmploymentStatus(EmploymentStatus.create(input));
      const draftObject = draftAccount.toObject();
      const data = draftObject.data as IndividualDraftAccountSchema;
      expect(data.employmentStatus).to.not.be.null;
      const { status } = data.employmentStatus as EmploymentStatusInput;
      expect(status).to.be.equal(EmploymentStatusEnum.EMPLOYED);
    });

    it('Or if the investor provides wrong input Then it should throw an error', async () => {
      const input = <EmploymentStatusInput>{};

      await expectThrowsAsync(() => draftAccount.setEmploymentStatus(EmploymentStatus.create(input)), 'employmentStatus:MISSING_MANDATORY_FIELDS');
    });

    const avatarId = '427aa662-a4da-48ee-a44f-780bd8743c93';
    const path = 'e78cd92b-cb1b-4e20-83eb-1c2d421cee34';
    it('Then add an avatar', async () => {
      const input = { id: avatarId, path };
      draftAccount.setAvatarDocument(Avatar.create(input));
      const { data } = draftAccount.toObject();
      const avatar = data?.avatar as AvatarInput;

      expect(avatar.id).to.be.equal(avatarId);
      expect(avatar.path).to.be.equal(path);
    });

    it('Or add an avatar without details Then expects validation error', async () => {
      const input = <AvatarInput>{ path };

      expectThrows(() => draftAccount.setAvatarDocument(Avatar.create(input)), 'avatar:MISSING_MANDATORY_FIELDS');
    });

    it('Then add an employer', async () => {
      const input = {
        nameOfEmployer: 'Housekeeping Ltd.',
        title: 'Housekeeper',
        industry: 'Housekeeping',
      };
      draftAccount.setEmployer(Employer.create(input));
      const { data } = draftAccount.toObject();
      const employer = data?.employer as EmployerInput;

      expect(employer.nameOfEmployer).to.be.equal(employer.nameOfEmployer);
      expect(employer.title).to.be.equal(employer.title);
      expect(employer.industry).to.be.equal(employer.industry);
    });

    it('Or add an employer without details Then expects validation error', async () => {
      const input = <EmployerInput>{
        title: 'Housekeeper',
      };

      expectThrows(() => draftAccount.setEmployer(Employer.create(input)), 'employer:MISSING_MANDATORY_FIELDS');
    });

    it('Then add an Net Worth', async () => {
      const range = '$10000-$1000000';
      const input = {
        range,
      };
      draftAccount.setNetWorth(NetWorth.create(input));
      const { data } = draftAccount.toObject();
      const netWorth = data?.netWorth as NetRangeInput;

      expect(netWorth.range).to.be.equal(range);
    });

    it('Or add an Net Worth without details Then expects validation error', async () => {
      const input = <NetRangeInput>{};

      expectThrows(() => draftAccount.setNetWorth(NetWorth.create(input)), 'netWorth:MISSING_MANDATORY_FIELDS');
    });

    it('Then verify the draft account and should not be completed yet', async () => {
      verifyIndividualDraftAccount(false);
    });

    it('Then add an Net Income', async () => {
      const range = '$10000-$1000000';
      const input = {
        range,
      };
      draftAccount.setNetIncome(NetIncome.create(input));
      const { data } = draftAccount.toObject();
      const netWorth = data?.netWorth as NetRangeInput;

      expect(netWorth.range).to.be.equal(range);
    });

    it('Or add an Net Income without details Then expects validation error', async () => {
      const input = <NetRangeInput>{};

      expectThrows(() => draftAccount.setNetIncome(NetIncome.create(input)), 'netIncome:MISSING_MANDATORY_FIELDS');
    });

    it('Then verify the draft account and it should be completed', async () => {
      verifyIndividualDraftAccount(true);
    });
  });
});
