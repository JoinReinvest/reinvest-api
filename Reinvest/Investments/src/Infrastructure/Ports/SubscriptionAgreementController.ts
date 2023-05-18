import CreateSubscriptionAgreement from '../UseCases/CreateSubscriptionAgreement';

export class SubscriptionAgreementController {
  private createSubscriptionAgreementUseCase: CreateSubscriptionAgreement;

  constructor(createSubscriptionAgreementUseCase: CreateSubscriptionAgreement) {
    this.createSubscriptionAgreementUseCase = createSubscriptionAgreementUseCase;
  }

  public static getClassName = (): string => 'SubscriptionAgreementController';

  public async createSubscriptionAgreement(profileId: string, accountId: string, investmentId: string) {
    return this.createSubscriptionAgreementUseCase.execute(profileId, accountId, investmentId);
  }
}
