import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import type SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';

export class SubscriptionAgreementController {
  private createSubscriptionAgreementUseCase: CreateSubscriptionAgreement;
  private subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery;
  private signSubscriptionAgreementUseCase: SignSubscriptionAgreement;
  private createRecurringSubscriptionAgreementUseCase: CreateRecurringSubscriptionAgreement;

  constructor(
    createSubscriptionAgreementUseCase: CreateSubscriptionAgreement,
    subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery,
    signSubscriptionAgreementUseCase: SignSubscriptionAgreement,
    createRecurringSubscriptionAgreementUseCase: CreateRecurringSubscriptionAgreement,
  ) {
    this.createSubscriptionAgreementUseCase = createSubscriptionAgreementUseCase;
    this.subscriptionAgreementQueryUseCase = subscriptionAgreementQueryUseCase;
    this.signSubscriptionAgreementUseCase = signSubscriptionAgreementUseCase;
    this.createRecurringSubscriptionAgreementUseCase = createRecurringSubscriptionAgreementUseCase;
  }

  public static getClassName = (): string => 'SubscriptionAgreementController';

  public async createSubscriptionAgreement(profileId: string, investmentId: string) {
    return await this.createSubscriptionAgreementUseCase.execute(profileId, investmentId);
  }

  public async createRecurringSubscriptionAgreement(profileId: string, accountId: string) {
    return await this.createRecurringSubscriptionAgreementUseCase.execute(profileId, accountId);
  }

  public async subscriptionAgreementQuery(profileId: string, subscriptionAgreementId: string) {
    return await this.subscriptionAgreementQueryUseCase.execute(profileId, subscriptionAgreementId);
  }

  public async signSubscriptionAgreement(profileId: string, investmentId: string, clientIp: string) {
    return await this.signSubscriptionAgreementUseCase.execute(profileId, investmentId, clientIp);
  }
}
