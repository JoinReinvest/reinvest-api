import {IncentiveToken} from "Identity/Domain/IncentiveToken";
import {IncentiveTokenRepository} from "Identity/Adapter/Database/Repository/IncentiveTokenRepository";

export class IncentiveTokenVerificationController {
    public static getClassName = (): string => "IncentiveTokenVerificationController";
    private incentiveTokenRepository: IncentiveTokenRepository;

    constructor(incentiveTokenRepository: IncentiveTokenRepository) {
        this.incentiveTokenRepository = incentiveTokenRepository;
    }

    async isIncentiveTokenValid(token: string): Promise<boolean> {
        try {
            const incentiveToken = new IncentiveToken(token);
            return await this.incentiveTokenRepository.verifyIncentiveTokenUniqueness(incentiveToken);
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
}