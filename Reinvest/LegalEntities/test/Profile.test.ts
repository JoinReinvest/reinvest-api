import {expect} from "chai";
import {Profile} from "Reinvest/LegalEntities/src/Domain/Profile";
import {PersonalName, PersonalNameInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "Reinvest/LegalEntities/src/Domain/ValueObject/Address";
import {
    IdentityDocument,
    IdScanInput
} from "Reinvest/LegalEntities/src/Domain/ValueObject/Document";
import {
    Domicile,
    DomicileInput,
    DomicileType,
    GreenCardInput,
    VisaInput
} from "Reinvest/LegalEntities/src/Domain/ValueObject/Domicile";
import {SSN, SSNInput, SSNSchema} from "Reinvest/LegalEntities/src/Domain/ValueObject/SSN";
import {
    AccreditedInvestorStatements, ForAccreditedInvestor,
    ForFINRA,
    ForPolitician,
    ForStakeholder,
    PersonalStatement,
    PersonalStatementInput,
    PersonalStatementType
} from "Reinvest/LegalEntities/src/Domain/ValueObject/PersonalStatements";
import {
    InvestingExperience, InvestingExperienceInput,
    InvestingExperienceType
} from "Reinvest/LegalEntities/src/Domain/ValueObject/InvestingExperience";

context("Given the user wants to complete the profile", () => {

    describe("When user provides data for the first time, the system creates a new profile", async () => {
        const externalId = "123456789";
        const profile = new Profile('123', externalId, '');

        const verifyProfile = (expectedResult: boolean) => {
            expect(profile.verifyCompletion()).to.be.equal(expectedResult);
        }

        it("Then verify the profile and should not be completed yet", async () => {
            verifyProfile(false);
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
            profile.setDateOfBirth(DateOfBirth.create({dateOfBirth: date}))
            const profileOutput = profile.toObject();
            const dob = profileOutput.dateOfBirth;

            expect(dob).to.be.equal(date);
        });

        it("Or if provided wrong date of birth, Then expects a validation error", async () => {
            const date = "12/24/2000";
            try {
                profile.setDateOfBirth(DateOfBirth.create({dateOfBirth: date}))
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
            const input = '111-22-3333'
            const ssnValueObject = SSN.createFromRawSSN(input);
            profile.setSSN(ssnValueObject);

            const profileOutput = profile.toObject();
            const ssn = profileOutput.ssnObject as unknown as SSNSchema;

            expect(ssn.anonymized).to.be.equal("***-**-3333");
            expect(ssnValueObject.decrypt()).to.be.equal(input);
        });

        it("And Then the SSN object output should be a valid input for regular SSN", async () => {
            const input = '111-22-3333'

            const ssnValueObject = SSN.createFromRawSSN(input);
            const rawObject = ssnValueObject.toObject();

            const restoredSsnValueObject = SSN.create(rawObject);
            const restoredRawObject = restoredSsnValueObject.toObject();

            expect(restoredRawObject.anonymized).to.be.equal("***-**-3333");
            expect(restoredSsnValueObject.decrypt()).to.be.equal(input);
        });

        it("Or complete the SSN without details Then expects validation error", async () => {
            const input = "";

            try {
                profile.setSSN(SSN.createFromRawSSN(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Or complete the SSN with wrong value Then expects validation error", async () => {
            const input = 'AAA-BB-1234'

            try {
                profile.setSSN(SSN.createFromRawSSN(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Then complete the investing experience", async () => {
            const input = {
                experience: InvestingExperienceType.EXPERT
            }
            profile.setInvestingExperience(InvestingExperience.create(input))

            const profileOutput = profile.toObject();
            const experience = profileOutput.investingExperience as InvestingExperienceInput;

            expect(experience.experience).to.be.equal(input.experience);
        });

        it("Or complete the investing experience with wrong data, Then expects validation error", async () => {
            const input = {
                experience: 'WRONG_VALUE'
            } as unknown as InvestingExperienceInput;

            try {
                profile.setInvestingExperience(InvestingExperience.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Or complete the investing experience without details Then expects validation error", async () => {
            const input = <InvestingExperienceInput>{}

            try {
                profile.setInvestingExperience(InvestingExperience.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

        it("Then add the statement that you are a FINRA member", async () => {
            const input = <PersonalStatementInput>{
                type: PersonalStatementType.FINRAMember,
                forFINRA: {
                    name: "Dalmore"
                }
            };
            profile.addStatement(PersonalStatement.create(input))
            const profileOutput = profile.toObject();
            const statements = profileOutput.statements as PersonalStatementInput[];

            expect(statements).length(1);
            const forFINRA = statements[0].forFINRA as ForFINRA;
            expect(statements[0].type).to.be.equal(PersonalStatementType.FINRAMember);
            expect(forFINRA.name).to.be.equal("Dalmore");
        });

        const politicianStatementCheck = (description: string) => {
            const input = <PersonalStatementInput>{
                type: PersonalStatementType.Politician,
                forPolitician: {
                    description
                }
            };
            profile.addStatement(PersonalStatement.create(input))
            const profileOutput = profile.toObject();
            const statements = profileOutput.statements as PersonalStatementInput[];

            expect(statements).length(2);
            const forPolitician = statements[1].forPolitician as ForPolitician;
            expect(statements[1].type).to.be.equal(PersonalStatementType.Politician);
            expect(forPolitician.description).to.be.equal(description);
        }

        it("And Then add the statement that you are a politician", async () => {
            const description = "Politician of some party";
            politicianStatementCheck(description);
        });

        it("And Then change the statement that you are a politician", async () => {
            const description = "Politician of another party";
            politicianStatementCheck(description);
        });

        it("And Then remove the statement that you are a politician", async () => {
            profile.removeStatement(PersonalStatementType.Politician);
            const profileOutput = profile.toObject();
            const statements = profileOutput.statements as PersonalStatementInput[];

            expect(statements).length(1);
            expect(statements[0].type).to.be.equal(PersonalStatementType.FINRAMember);
        });

        it("And Then add the statement that you are a public trading company stakeholder", async () => {
            const tickerSymbols = ["RED", "BLUE"];
            const input = <PersonalStatementInput>{
                type: PersonalStatementType.TradingCompanyStakeholder,
                forStakeholder: {
                    tickerSymbols
                }
            };
            profile.addStatement(PersonalStatement.create(input))
            const profileOutput = profile.toObject();
            const statements = profileOutput.statements as PersonalStatementInput[];

            expect(statements).length(2);
            const forStakeholder = statements[1].forStakeholder as ForStakeholder;
            expect(statements[1].type).to.be.equal(PersonalStatementType.TradingCompanyStakeholder);
            expect(forStakeholder.tickerSymbols).to.include.members(tickerSymbols);
        });

        const checkAccreditedInvestor = (statement: AccreditedInvestorStatements) => {
            const input = <PersonalStatementInput>{
                type: PersonalStatementType.AccreditedInvestor,
                forAccreditedInvestor: {
                    statement
                }
            };
            profile.addStatement(PersonalStatement.create(input))
            const profileOutput = profile.toObject();
            const statements = profileOutput.statements as PersonalStatementInput[];

            expect(statements).length(3);
            const forAccreditedInvestor = statements[2].forAccreditedInvestor as ForAccreditedInvestor;
            expect(statements[2].type).to.be.equal(PersonalStatementType.AccreditedInvestor);
            expect(forAccreditedInvestor.statement).to.be.equal(statement);
        };

        it("Then verify the profile and should not be completed yet", async () => {
            verifyProfile(false);
        });

        it("And Then add the statement that you are an accredited investor", async () => {
            checkAccreditedInvestor(AccreditedInvestorStatements.I_AM_AN_ACCREDITED_INVESTOR);
        });

        it("Then verify the profile and should be completed now", async () => {
            verifyProfile(true);
        });

        it("And Then change you statement that you are not accredited investor", async () => {
            checkAccreditedInvestor(AccreditedInvestorStatements.I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME);
        });

        it("Or add the statement without all required data Then expects validation error", async () => {
            const input = <PersonalStatementInput>{
                type: PersonalStatementType.AccreditedInvestor
            };

            try {
                profile.addStatement(PersonalStatement.create(input))
            } catch (error: any) {
                expect(error).to.exist;
            }
        });

    });
});
