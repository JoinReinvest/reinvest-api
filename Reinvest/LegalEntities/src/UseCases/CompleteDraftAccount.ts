import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {
    CompanyDraftAccount,
    CompanyDraftAccountType, DraftAccount,
    DraftAccountType, IndividualDraftAccount
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/ValueObject/EmploymentStatus";
import {Avatar} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/ValueObject/Employer";
import {NetIncome, NetRangeInput, NetWorth} from "LegalEntities/Domain/ValueObject/ValueRange";
import {
    ValidationError,
    ValidationErrorEnum,
    ValidationErrorType
} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type IndividualDraftAccountInput = {
    employmentStatus?: EmploymentStatusInput
    employer?: EmployerInput,
    netWorth?: NetRangeInput,
    netIncome?: NetRangeInput,
    avatar?: { id: string },
    verifyAndFinish?: boolean
};

export type CompanyDraftAccountInput = {

    avatar?: { id: string },
    verifyAndFinish?: boolean
};


export class CompleteDraftAccount {
    public static getClassName = (): string => "CompleteDraftAccount";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
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
                        case 'verifyAndFinish':
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

            if (errors.length === 0 && input.verifyAndFinish) {
                if (draft.verifyCompletion()) {
                    draft.setAsCompleted();
                } else {
                    errors.push(<ValidationErrorType>{
                        type: ValidationErrorEnum.FAILED,
                        field: "verifyAndFinish",
                    });
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
                        // case 'employmentStatus':
                        //     draft.setEmploymentStatus(EmploymentStatus.create(data));
                        //     break;
                        // case 'avatar':
                        //     const {id} = data;
                        //     draft.setAvatarDocument(Avatar.create({id, path: profileId}));
                        //     break;
                        // case 'employer':
                        //     draft.setEmployer(Employer.create(data))
                        //     break;
                        // case 'netWorth':
                        //     draft.setNetWorth(NetWorth.create(data))
                        //     break;
                        // case 'netIncome':
                        //     draft.setNetIncome(NetIncome.create(data))
                        //     break;
                        // case 'verifyAndFinish':
                        //     break;
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

            if (errors.length === 0 && input.verifyAndFinish) {
                if (draft.verifyCompletion()) {
                    draft.setAsCompleted();
                } else {
                    errors.push(<ValidationErrorType>{
                        type: ValidationErrorEnum.FAILED,
                        field: "verifyAndFinish",
                    });
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