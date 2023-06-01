import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { Money } from 'Money/Money';

export type RecurringInvestmentCreate = {
  accountId: string;
  frequency: RecurringInvestmentFrequency;
  money: Money;
  portfolioId: string;
  profileId: string;
  startDate: string;
  status: RecurringInvestmentStatus;
};

class DeleteRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository, subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  static getClassName = (): string => 'DeleteRecurringInvestment';

  async execute(profileId: string, accountId: string, status: RecurringInvestmentStatus) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, status);

    const subscriptionAgreementId = recurringInvestment?.getSubscriptionAgreeementId();

    if (subscriptionAgreementId) {
      await this.subscriptionAgreementRepository.delete(accountId, subscriptionAgreementId);
    }

    const isDeleted = await this.recurringInvestmentsRepository.delete(accountId, profileId);

    return isDeleted;
  }
}

export default DeleteRecurringInvestment;
