import {expect} from "chai";
import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import * as sinon from "ts-sinon";
import {
    DraftAccount,
    DraftAccountState,
    DraftAccountType,
    IndividualDraftAccount, IndividualDraftAccountSchema
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import expectThrowsAsync from "test/characterization/expectThrowsAsync";
import {
    EmploymentStatus,
    EmploymentStatusEnum,
    EmploymentStatusInput
} from "LegalEntities/Domain/DraftAccount/EmploymentStatus";

context("Given an investor has completed profile", () => {
    describe("When the investor wants to create the individual account", async () => {
        const draftAccountRepository = sinon.stubInterface<DraftAccountRepository>();
        const createDraftAccountUseCase = new CreateDraftAccount(draftAccountRepository)
        it("Then the investor creates a individual draft account", async () => {
            draftAccountRepository.getActiveDraftsOfType.returns([] as any);
            draftAccountRepository.storeDraft.returns(true as any);

            const draftId = await createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL);
            expect(draftId).to.be.not.empty;
            expect(draftId).to.be.a('string');
        });

        it("Or Then throw an error if the individual draft account already exist in Active state", async () => {
            draftAccountRepository.getActiveDraftsOfType.returns([{} as IndividualDraftAccount] as any);
            await expectThrowsAsync(
                () => createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL),
                "Draft account already exist")
        });

        it("Or Then throw an error if it can't create a draft account", async () => {
            draftAccountRepository.getActiveDraftsOfType.returns([] as any);
            draftAccountRepository.storeDraft.returns(false as any);
            await expectThrowsAsync(
                () => createDraftAccountUseCase.execute('some-uuid', DraftAccountType.INDIVIDUAL),
                "Cannot create draft account")
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

context("Given an investor created an individual draft account", () => {
    const draftId = "f962e397-ab99-4b64-af98-4084a2294152";
    const profileId = "9a97b97e-8bfe-4572-8bbf-b335896b0b14";
    describe("When the investor wants to complete draft", async () => {
        const draftAccount = DraftAccount.create({
            profileId,
            draftId,
            accountType: DraftAccountType.INDIVIDUAL,
            state: DraftAccountState.ACTIVE,
            data: null
        }) as IndividualDraftAccount;

        it("Then the investor provides employment status", async () => {
            const input = <EmploymentStatusInput>{
                status: EmploymentStatusEnum.EMPLOYED
            };

            draftAccount.setEmploymentStatus(EmploymentStatus.create(input));
            const draftObject = draftAccount.toObject();
            const data = draftObject.data as IndividualDraftAccountSchema;
            expect(data.employmentStatus).to.not.be.null;
            const {status} = data.employmentStatus as EmploymentStatusInput;
            expect(status).to.be.equal(EmploymentStatusEnum.EMPLOYED);
        });

        it("Or if the investor provides wrong input Then it should throw an error", async () => {
            const input = <EmploymentStatusInput>{};

            await expectThrowsAsync(
                () => draftAccount.setEmploymentStatus(EmploymentStatus.create(input)),
                "WRONG_EMPLOYMENT_STATUS_TYPE"
            )
        });

    });
});