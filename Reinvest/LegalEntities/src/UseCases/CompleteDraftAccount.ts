import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {IndividualDraftAccount} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/DraftAccount/EmploymentStatus";

export type IndividualDraftAccountInput = {
    employmentStatus?: EmploymentStatusInput
    employer?: {
        nameOfEmployer: string,
        occupation: string,
        industry: string
    },
    netWorth?: { range: string },
    netIncome?: { range: string },
    avatar?: { id: string },
    verify?: boolean
};

export class CompleteDraftAccount {
    public static getClassName = (): string => "CompleteDraftAccount";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
    }

    public async completeIndividual(profileId: string, draftAccountId: string, individualInput: IndividualDraftAccountInput): Promise<string[]> {
        const errors = []
        try {
            const draft = await this.draftAccountRepository.getDraftForProfile<IndividualDraftAccount>(profileId, draftAccountId);

            if (!draft.isActive()) {
                throw new Error("DRAFT_IS_NOT_ACTIVE");
            }

            if (!draft.isIndividual()) {
                throw new Error("DRAFT_IS_NOT_INDIVIDUAL_TYPE");
            }

            for (const step of Object.keys(individualInput)) {
                try {
                    // @ts-ignore
                    const data = individualInput[step];
                    switch (step) {
                        case 'employmentStatus':
                            draft.setEmploymentStatus(EmploymentStatus.create(data));
                            break;
                        case 'verify':
                            break;
                        default:
                            console.error(`Unknown step: ${step}`);

                            errors.push(`UNKNOWN_STEP_${step}`);
                            break;
                    }
                } catch (error: any) {
                    errors.push(error.message);
                }
            }

            // if (errors.length === 0 && individualInput.verify) {
            //     if (!draft.verifyCompletion()) {
            //
            //         errors.push('Draft account completion verification failed');
            //     }
            // }

            await this.draftAccountRepository.storeDraft(draft);
        } catch (error: any) {
            errors.push(error.message);
        }

        return errors;
    }
}