import {expect} from "chai";
import * as sinon from "ts-sinon";
import {ProfileRepository} from "Reinvest/LegalEntities/src/Adapter/Database/Repository/ProfileRepository";
import {LegalEntitiesDatabaseAdapterProvider} from "Reinvest/LegalEntities/src/Adapter/Database/DatabaseAdapter";
import {IdGeneratorInterface} from "shared/hkek-id-generator/IdGenerator";
import {Profile} from "Reinvest/LegalEntities/src/Domain/Profile";
import {PersonalName, PersonalNameInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/Address";
import {
    Avatar,
    AvatarInput,
    IdentityDocument,
    IdScanInput
} from "Reinvest/LegalEntities/src/Domain/ValueObject/Document";
import {
    Domicile,
    DomicileInput,
    DomicileType,
    GreenCardInput, VisaInput
} from "Reinvest/LegalEntities/src/Domain/ValueObject/Domicile";
import {SSN, SSNInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/SSN";

context("Given the user wants to complete the profile", () => {
    const dbProvider = sinon.stubInterface<LegalEntitiesDatabaseAdapterProvider>();
    const idGenerator = sinon.stubInterface<IdGeneratorInterface>();
    const profileRepository = new ProfileRepository(dbProvider, idGenerator);

    describe("When user provides data for the first time", async () => {
        const externalId = "123456789";
        idGenerator.createNumericId.returns(externalId);

        it("Then the system must create the profile", async () => {
            const profile = await profileRepository.findOrCreateProfile('123');
            expect(profile.toObject().externalId).is.equal(externalId);
        });

        const profile = new Profile('123', externalId, '');

        it("Then store the empty profile in the database", async () => {
            const outputProfile = profile.toObject();
            expect(outputProfile.name).to.be.null;
        });

        it("Then complete the name", async () => {
            const inputName = {
                firstName: 'Firstname',
                lastName: 'Lastname',
                middleName: 'Middlename'
            };
            profile.setName(PersonalName.create(inputName))
            const profileOutput = profile.toObject();
            const name = profileOutput.name as PersonalNameInput;

            expect(name.firstName).to.be.equal(inputName.firstName);
            expect(name.lastName).to.be.equal(inputName.lastName);
            expect(name.middleName).to.be.equal(inputName.middleName);
        });

        it("Or complete the name without middle name", async () => {
            const inputName = {
                firstName: 'Firstname',
                lastName: 'Lastname'
            };
            profile.setName(PersonalName.create(inputName))
            const profileOutput = profile.toObject();
            const name = profileOutput.name as PersonalNameInput;
            expect(name.firstName).to.be.equal(inputName.firstName);
            expect(name.lastName).to.be.equal(inputName.lastName);
            expect(name.middleName).to.be.equal("");
        });

        it("Or complete the name without details Then expects validation error", async () => {
            const inputName = <PersonalNameInput>{
                firstName: 'Firstname',
            };
            try {
                profile.setName(PersonalName.create(inputName))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Then complete the date of birth in ISO format", async () => {
            const date = "2000-12-24";
            profile.setDateOfBirth(DateOfBirth.create(date))
            const profileOutput = profile.toObject();
            const dob = profileOutput.dateOfBirth as DateOfBirthInput;

            expect(dob).to.be.equal(date);
        });

        it("Or if provided wrong date of birth, Then expects a validation error", async () => {
            const date = "12/24/2000";
            try {
                profile.setDateOfBirth(DateOfBirth.create(date))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        const validateAddress = (address: AddressInput, input: AddressInput) => {
            expect(address.addressLine1).to.be.equal(input.addressLine1);
            expect(address.city).to.be.equal(input.city);
            expect(address.zip).to.be.equal(input.zip);
            expect(address.country).to.be.equal(input.country);
            expect(address.state).to.be.equal(input.state);
        }

        it("Then complete the permanent address", async () => {
            const input = {
                addressLine1: "Sausage line",
                addressLine2: "2a/1",
                city: "NYC",
                zip: "90210",
                country: "USA",
                state: "NY"
            };
            profile.setAddress(Address.create(input))
            const profileOutput = profile.toObject();
            const address = profileOutput.address as AddressInput;

            validateAddress(address, input);
            expect(address.addressLine2).to.be.equal(input.addressLine2);
        });

        it("Or set up valid address without address line 2", async () => {
            const input = {
                addressLine1: "Sausage line",
                city: "NYC",
                zip: "90210",
                country: "USA",
                state: "NY"
            };

            profile.setAddress(Address.create(input))
            const profileOutput = profile.toObject();
            const address = profileOutput.address as AddressInput;

            validateAddress(address, input);
            expect(address.addressLine2).to.be.equal("");
        });

        it("Or if invalid address format Then expects validation error", async () => {
            const input = {
                addressLine1: "Sausage line",
                addressLine2: "2a/1",
                city: "NYC",
                state: "NY"
            };

            try {
                profile.setAddress(Address.create(<AddressInput>input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        const ids = ['427aa662-a4da-48ee-a44f-780bd8743c93', '7ca02cbe-db35-413b-8fe3-1851643ab3b7'];
        const path = '6539e4e3-802b-4a83-9197-0a0f41832317';
        it("Then add ID scans", async () => {
            const input = {ids, path};
            profile.setIdentityDocument(IdentityDocument.create(input))
            const profileOutput = profile.toObject();
            const idScan = profileOutput.idScan as IdScanInput;

            expect(idScan.ids).to.include.members(ids);
            expect(idScan.path).to.be.equal(path);
        });

        it("Or if ids list is empty Then expects validation error", async () => {
            const input = {ids: [], path};

            try {
                profile.setIdentityDocument(IdentityDocument.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Or id scan without details Then expects validation error", async () => {
            const input = {ids: []} as unknown as IdScanInput;
            try {
                profile.setIdentityDocument(IdentityDocument.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        const avatarId = '427aa662-a4da-48ee-a44f-780bd8743c93';
        it("Then add an avatar", async () => {
            const input = {id: avatarId, path};
            profile.setAvatarDocument(Avatar.create(input))
            const profileOutput = profile.toObject();
            const avatar = profileOutput.avatar as AvatarInput;

            expect(avatar.id).to.be.equal(avatarId);
            expect(avatar.path).to.be.equal(path);
        });

        it("Or add an avatar without details Then expects validation error", async () => {
            const input = <AvatarInput>{path};
            try {
                profile.setAvatarDocument(Avatar.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Then complete the US Citizen Domicile", async () => {
            const input = <DomicileInput>{
                type: DomicileType.CITIZEN
            };
            profile.setDomicile(Domicile.create(input))
            const profileOutput = profile.toObject();
            const domicile = profileOutput.domicile as DomicileInput;

            expect(domicile.type).to.be.equal(DomicileType.CITIZEN);
        });

        it("Or Then complete the Green Card Resident Domicile", async () => {
            const input = <DomicileInput>{
                type: DomicileType.GREEN_CARD,
                forGreenCard: {
                    birthCountry: 'France',
                    citizenshipCountry: 'UK'
                }
            };
            profile.setDomicile(Domicile.create(input))

            const profileOutput = profile.toObject();
            const domicile = profileOutput.domicile as DomicileInput;
            const forGreenCard = domicile.forGreenCard as GreenCardInput;

            expect(domicile.type).to.be.equal(DomicileType.GREEN_CARD);
            expect(forGreenCard.birthCountry).to.be.equal('France');
            expect(forGreenCard.citizenshipCountry).to.be.equal('UK');
        });

        it("Or complete the Green Card Resident Domicile without details Then expects validation error", async () => {
            const input = <DomicileInput>{
                type: DomicileType.GREEN_CARD,
            };

            try {
                profile.setDomicile(Domicile.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Or Then complete the Visa Resident Domicile", async () => {
            const input = <DomicileInput>{
                type: DomicileType.VISA,
                forVisa: {
                    birthCountry: 'France',
                    citizenshipCountry: 'UK',
                    visaType: 'F-1',
                }
            };
            profile.setDomicile(Domicile.create(input))

            const profileOutput = profile.toObject();
            const domicile = profileOutput.domicile as DomicileInput;
            const forVisa = domicile.forVisa as VisaInput;

            expect(domicile.type).to.be.equal(DomicileType.VISA);
            expect(forVisa.birthCountry).to.be.equal('France');
            expect(forVisa.citizenshipCountry).to.be.equal('UK');
            expect(forVisa.visaType).to.be.equal('F-1');
        });

        it("Or complete the visa Resident Domicile without details Then expects validation error", async () => {
            const input = <DomicileInput>{
                type: DomicileType.VISA,
                forGreenCard: {
                    birthCountry: 'France',
                    citizenshipCountry: 'UK'
                }
            };

            try {
                profile.setDomicile(Domicile.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Then complete the SSN", async () => {
            const input = <SSNInput>{
                ssn: 'AAA-GG-SSSS'
            };
            profile.setSSN(SSN.create(input))

            const profileOutput = profile.toObject();
            const ssn = profileOutput.ssn as unknown as SSNInput;

            expect(ssn.ssn).to.be.equal(input.ssn);
        });

        it("Or complete the SSN without details Then expects validation error", async () => {
            const input = <SSNInput>{};

            try {
                profile.setSSN(SSN.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });
    });
});
