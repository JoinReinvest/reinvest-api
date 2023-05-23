import CreateSubscriptionAgreement from '../UseCases/CreateSubscriptionAgreement';
import SubscriptionAgreementQuery from '../UseCases/SubscriptionAgreementQuery';

export class SubscriptionAgreementController {
  private createSubscriptionAgreementUseCase: CreateSubscriptionAgreement;
  private subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery;

  constructor(createSubscriptionAgreementUseCase: CreateSubscriptionAgreement, subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery) {
    this.createSubscriptionAgreementUseCase = createSubscriptionAgreementUseCase;
    this.subscriptionAgreementQueryUseCase = subscriptionAgreementQueryUseCase;
  }

  public static getClassName = (): string => 'SubscriptionAgreementController';

  public async createSubscriptionAgreement(profileId: string, investmentId: string) {
    return this.createSubscriptionAgreementUseCase.execute(profileId, investmentId);
  }

  public async subscriptionAgreementQuery(profileId: string, subscriptionAgreementId: string) {
    return this.subscriptionAgreementQueryUseCase.execute(profileId, subscriptionAgreementId);
  }
}
