import { DomainEvent } from 'SimpleAggregator/Types';

import { InvestmentStatus } from '../../Domain/Investments/Types';
import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';

class AssignSubscriptionAgreementToInvestment {
  static getClassName = (): string => 'AssignSubscriptionAgreementToInvestment';

  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  async execute(investmentId: string, subscriptionAgreementId: string) {
    const events: DomainEvent[] = [];

    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    investment.assignSubscriptionAgreement(subscriptionAgreementId);
    investment.updateStatus(InvestmentStatus.WAITING_FOR_FEES_APPROVAL);

    const isAssigned = await this.investmentsRepository.assignSubscriptionAgreementAndUpdateStatus(investment);

    if (isAssigned) {
      events.push({
        id: subscriptionAgreementId,
        kind: 'SubscriptionAgreementSigned',
      });

      await this.investmentsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default AssignSubscriptionAgreementToInvestment;
