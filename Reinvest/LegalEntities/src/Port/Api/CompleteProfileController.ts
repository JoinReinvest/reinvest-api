import {CompleteProfile, CompleteProfileInput} from "LegalEntities/UseCases/CompleteProfile";

export class CompleteProfileController {
    public static getClassName = (): string => "CompleteProfileController";
    private completeProfileUseCase: CompleteProfile;

    constructor(completeProfileUseCase: CompleteProfile) {
        this.completeProfileUseCase = completeProfileUseCase;
    }

    public async completeProfile(input: CompleteProfileInput, profileId: string): Promise<string[]> {
        return this.completeProfileUseCase.execute(input, profileId);
    }
}