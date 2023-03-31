import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {IndividualDraftAccount} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/ValueObject/EmploymentStatus";
import {Avatar} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/ValueObject/Employer";
import {NetIncome, NetRangeInput, NetWorth} from "LegalEntities/Domain/ValueObject/ValueRange";
import {ValidationErrorEnum, ValidationErrorType} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type IndividualDraftAccountInput = {
    employmentStatus?: EmploymentStatusInput
    employer?: EmployerInput,
    netWorth?: NetRangeInput,
    netIncome?: NetRangeInput,
    avatar?: { id: string },
    verifyAndFinish?: boolean
};

export class CompleteDraftAccount {
    public static getClassName = (): string => "CompleteDraftAccount";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
    }

    public async completeIndividual(profileId: string, draftAccountId: string, individualInput: IndividualDraftAccountInput): Promise<ValidationErrorType[]> {
        const errors = []
        try {
            const draft = await this.draftAccountRepository.getDraftForProfile<IndividualDraftAccount>(profileId, draftAccountId);

            if (!draft.isActive()) {
                errors.push(<ValidationErrorType>{
                    type: ValidationErrorEnum.NOT_ACTIVE,
                    field: "draft",
                });
                return errors;
            }

            if (!draft.isIndividual()) {
                errors.push(<ValidationErrorType>{
                    type: ValidationErrorEnum.NOT_INDIVIDUAL,
                    field: "draft",
                });

                return errors;
            }

            for (const step of Object.keys(individualInput)) {
                try {
                    
                    const data = individualInput[step];
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

            if (errors.length === 0 && individualInput.verifyAndFinish) {
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
}
