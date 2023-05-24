import CreateSubscriptionAgreement from '../UseCases/CreateSubscriptionAgreement';
import SignSubscriptionAgreement from '../UseCases/SignSubscriptionAgreement';
import type SubscriptionAgreementQuery from '../UseCases/SubscriptionAgreementQuery';

export class SubscriptionAgreementController {
  private createSubscriptionAgreementUseCase: CreateSubscriptionAgreement;
  private subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery;
  private signSubscriptionAgreementUseCase: SignSubscriptionAgreement;

  constructor(
    createSubscriptionAgreementUseCase: CreateSubscriptionAgreement,
    subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery,
    signSubscriptionAgreementUseCase: SignSubscriptionAgreement,
  ) {
    this.createSubscriptionAgreementUseCase = createSubscriptionAgreementUseCase;
    this.subscriptionAgreementQueryUseCase = subscriptionAgreementQueryUseCase;
    this.signSubscriptionAgreementUseCase = signSubscriptionAgreementUseCase;
  }

  public static getClassName = (): string => 'SubscriptionAgreementController';

  public async createSubscriptionAgreement(profileId: string, investmentId: string) {
    return await this.createSubscriptionAgreementUseCase.execute(profileId, investmentId);
  }

  public async subscriptionAgreementQuery(profileId: string, subscriptionAgreementId: string) {
    return await this.subscriptionAgreementQueryUseCase.execute(profileId, subscriptionAgreementId);
  }

  public async signSubscriptionAgreement(profileId: string, investmentId: string) {
    return await this.signSubscriptionAgreementUseCase.execute(profileId, investmentId);
  }
}
