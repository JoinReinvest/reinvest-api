import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {
    CompanyDraftAccount,
    DraftAccount,
    DraftAccountType, IndividualDraftAccount
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/ValueObject/EmploymentStatus";
import {Avatar} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/ValueObject/Employer";
import {
    NetIncome,
    ValueRangeInput,
    NetWorth,
    AnnualRevenue,
    NumberOfEmployees
} from "LegalEntities/Domain/ValueObject/ValueRange";
import {
    Uuid,
    ValidationError,
    ValidationErrorEnum,
    ValidationErrorType
} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {Company, CompanyName, CompanyNameInput, CompanyTypeInput} from "../Domain/ValueObject/Company";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {
    EIN,
    SensitiveNumberInput,
} from "LegalEntities/Domain/ValueObject/SensitiveNumber";
import {Industry, ValueStringInput} from "LegalEntities/Domain/ValueObject/ValueString";
import {Stakeholder, StakeholderInput} from "LegalEntities/Domain/ValueObject/Stakeholder";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";

export type IndividualDraftAccountInput = {
    employmentStatus?: EmploymentStatusInput
    employer?: EmployerInput,
    netWorth?: ValueRangeInput,
    netIncome?: ValueRangeInput,
    avatar?: { id: string }
};

export type CompanyDraftAccountInput = {
    name?: CompanyNameInput,
    ein?: { ein: SensitiveNumberInput },
    address?: AddressInput,
    annualRevenue?: ValueRangeInput,
    numberOfEmployees?: ValueRangeInput,
    industry?: ValueStringInput,
    companyType?: CompanyTypeInput,
    stakeholders?: StakeholderInput[],
    removeStakeholders?: { id: string }[],
    avatar?: { id: string }
};


export class CompleteDraftAccount {
    public static getClassName = (): string => "CompleteDraftAccount";
    private draftAccountRepository: DraftAccountRepository;
    private uniqueIdGenerator: IdGeneratorInterface;

    constructor(draftAccountRepository: DraftAccountRepository, uniqueIdGenerator: IdGeneratorInterface) {
        this.draftAccountRepository = draftAccountRepository;
        this.uniqueIdGenerator = uniqueIdGenerator;
    }

    public async completeIndividual(
        profileId: string,
        draftAccountId: string,
        input: IndividualDraftAccountInput
    ): Promise<ValidationErrorType[]> {
        const errors = []
        try {
            const draft = await this.getDraftAccount<IndividualDraftAccount>(profileId, draftAccountId, DraftAccountType.INDIVIDUAL);

            for (const step of Object.keys(input)) {
                try {
                    // @ts-ignore
                    const data = input[step];
                    if (data === null) {
                        errors.push(<ValidationErrorType>{
                            type: ValidationErrorEnum.EMPTY_VALUE,
                            field: step,
                        });
                        continue;
                    }
                    switch (step) {
                        case 'employmentStatus':
                            draft.setEmploymentStatus(EmploymentStatus.create(data));
                            break;
                        case 'avatar':
                            const {id} = data;
                            draft.setAvatarDocument(Avatar.create({id, path: profileId}));
                            break;
                        case 'employer':
                            draft.setEmployer(Employer.create(data))
                            break;
                        case 'netWorth':
                            draft.setNetWorth(NetWorth.create(data))
                            break;
                        case 'netIncome':
                            draft.setNetIncome(NetIncome.create(data))
                            break;
                        default:
                            errors.push(<ValidationErrorType>{
                                type: ValidationErrorEnum.UNKNOWN_ERROR,
                                field: step,
                            });
                            break;
                    }
                } catch (error: any) {
                    if ('getValidationError' in error) {
                        errors.push(error.getValidationError());
                    } else {
                        console.error(error.message);
                        errors.push(<ValidationErrorType>{
                            type: ValidationErrorEnum.UNKNOWN_ERROR,
                            field: step,
                        });
                    }
                }
            }

            await this.draftAccountRepository.storeDraft(draft);
        } catch (error: any) {
            console.error(error.message);
            errors.push(<ValidationErrorType>{
                type: ValidationErrorEnum.UNKNOWN_ERROR,
                field: 'draft',
            });
        }

        return errors;
    }

    public async completeCompany(
        profileId: string,
        draftAccountId: string,
        accountType: DraftAccountType,
        input: CompanyDraftAccountInput
    ): Promise<ValidationErrorType[]> {
        const errors = [];
        try {
            const draft = await this.getDraftAccount<CompanyDraftAccount>(profileId, draftAccountId, accountType);

            for (const step of Object.keys(input)) {
                try {
                    // @ts-ignore
                    const data = input[step];
                    if (data === null) {
                        errors.push(<ValidationErrorType>{
                            type: ValidationErrorEnum.EMPTY_VALUE,
                            field: step,
                        });
                        continue;
                    }
                    switch (step) {
                        case 'companyName':
                            draft.setCompanyName(CompanyName.create(data));
                            break;
                        case 'address':
                            draft.setAddress(Address.create(data));
                            break;
                        case 'ein':
                            const {ein: einValue} = data;
                            const ein = EIN.createFromRawEIN(einValue);
                            draft.setEIN(ein);
                            // if (await this.profileRepository.isSSNUnique(ssn, profileId)) {
                            //     profile.setSSN(ssn);
                            // } else {
                            //     errors.push(<ValidationErrorType>{
                            //         type: ValidationErrorEnum.NOT_UNIQUE,
                            //         field: "ssn",
                            //     });
                            // }
                            break;
                        case 'annualRevenue':
                            draft.setAnnualRevenue(AnnualRevenue.create(data));
                            break;
                        case 'numberOfEmployees':
                            draft.setNumberOfEmployees(NumberOfEmployees.create(data));
                            break;
                        case 'industry':
                            draft.setIndustry(Industry.create(data));
                            break;
                        case 'companyType':
                            draft.setCompanyType(Company.create(data));
                            break;
                        case 'avatar':
                            const {id} = data;
                            draft.setAvatarDocument(Avatar.create({id, path: profileId}));
                            break;
                        case 'companyDocuments':
                            data.map((document: { id: string, fileName: string }) => (
                                draft.addDocument({
                                    id: document.id,
                                    fileName: document.fileName,
                                    path: profileId
                                }))
                            );
                            break;
                        case 'removeDocuments':
                            data.map((document: { id: string, fileName: string }) => (
                                draft.removeDocument({
                                    id: document.id,
                                    fileName: document.fileName,
                                    path: profileId
                                }))
                            );
                            break;
                        case 'stakeholders':
                            data.map((stakeholder: StakeholderInput) => {
                                const stakeholderSchema = {...stakeholder} as StakeholderInput;
                                const {ssn: {ssn}, idScan} = stakeholder;
                                // @ts-ignore
                                stakeholderSchema.ssn = ssn;
                                stakeholderSchema.id = this.uniqueIdGenerator.createUuid();

                                stakeholderSchema.idScan = idScan.map((document: { id: string, fileName: string }) => ({
                                    id: document.id,
                                    fileName: document.fileName,
                                    path: profileId
                                }));
                                draft.addStakeholder(Stakeholder.create(stakeholderSchema))
                            });
                            break;
                        case 'removeStakeholders':
                            data.map((idToRemove: { id: string }) => {
                                const {id} = idToRemove;
                                draft.removeStakeholder(Uuid.create(id))
                            });
                            break;
                        default:
                            errors.push(<ValidationErrorType>{
                                type: ValidationErrorEnum.UNKNOWN_ERROR,
                                field: step,
                            });
                            break;
                    }
                } catch (error: any) {
                    if ('getValidationError' in error) {
                        errors.push(error.getValidationError());
                    } else {
                        console.error(error.message);
                        errors.push(<ValidationErrorType>{
                            type: ValidationErrorEnum.UNKNOWN_ERROR,
                            field: step,
                        });
                    }
                }
            }

            await this.draftAccountRepository.storeDraft(draft);
        } catch (error: any) {
            console.error(error.message);
            errors.push(<ValidationErrorType>{
                type: ValidationErrorEnum.UNKNOWN_ERROR,
                field: 'draft',
            });
        }

        return errors;
    }

    private async getDraftAccount<DraftType extends DraftAccount>(profileId: string, draftAccountId: string, accountType: DraftAccountType): Promise<DraftType> {
        const draft = await this.draftAccountRepository.getDraftForProfile<DraftType>(profileId, draftAccountId);

        if (!draft.isActive()) {
            throw new ValidationError(ValidationErrorEnum.NOT_ACTIVE, "draft")
        }

        if (!draft.isType(accountType)) {
            throw new ValidationError(ValidationErrorEnum.WRONG_TYPE, "draft")
        }

        return draft;
    }
}