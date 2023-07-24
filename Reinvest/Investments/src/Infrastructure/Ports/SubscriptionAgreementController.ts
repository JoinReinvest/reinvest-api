import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import SignRecurringSubscriptionAgreement from 'Investments/Application/UseCases/SignRecurringSubscriptionAgreement';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import type SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';

export class SubscriptionAgreementController {
  private createSubscriptionAgreementUseCase: CreateSubscriptionAgreement;
  private subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery;
  private signSubscriptionAgreementUseCase: SignSubscriptionAgreement;
  private signRecurringSubscriptionAgreementUseCase: SignRecurringSubscriptionAgreement;
  private createRecurringSubscriptionAgreementUseCase: CreateRecurringSubscriptionAgreement;

  constructor(
    createSubscriptionAgreementUseCase: CreateSubscriptionAgreement,
    subscriptionAgreementQueryUseCase: SubscriptionAgreementQuery,
    signSubscriptionAgreementUseCase: SignSubscriptionAgreement,
    signRecurringSubscriptionAgreementUseCase: SignRecurringSubscriptionAgreement,
    createRecurringSubscriptionAgreementUseCase: CreateRecurringSubscriptionAgreement,
  ) {
    this.createSubscriptionAgreementUseCase = createSubscriptionAgreementUseCase;
    this.subscriptionAgreementQueryUseCase = subscriptionAgreementQueryUseCase;
    this.signSubscriptionAgreementUseCase = signSubscriptionAgreementUseCase;
    this.signRecurringSubscriptionAgreementUseCase = signRecurringSubscriptionAgreementUseCase;
    this.createRecurringSubscriptionAgreementUseCase = createRecurringSubscriptionAgreementUseCase;
  }

  public static getClassName = (): string => 'SubscriptionAgreementController';

  public async createSubscriptionAgreement(profileId: string, investmentId: string) {
    return this.createSubscriptionAgreementUseCase.execute(profileId, investmentId);
  }

  public async createRecurringSubscriptionAgreement(profileId: string, accountId: string) {
    return this.createRecurringSubscriptionAgreementUseCase.execute(profileId, accountId);
  }

  public async subscriptionAgreementQuery(profileId: string, subscriptionAgreementId: string) {
    return this.subscriptionAgreementQueryUseCase.execute(profileId, subscriptionAgreementId);
  }

  public async signSubscriptionAgreement(profileId: string, investmentId: string, clientIp: string) {
    return this.signSubscriptionAgreementUseCase.execute(profileId, investmentId, clientIp);
  }

  public async signRecurringSubscriptionAgreement(profileId: string, accountId: string, clientIp: string) {
    return this.signRecurringSubscriptionAgreementUseCase.execute(profileId, accountId, clientIp);
  }
}
