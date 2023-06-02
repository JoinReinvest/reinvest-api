import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

import { InvestmentStatus } from '../../Domain/Investments/Types';
import { InvestmentsRepository } from '../../Infrastructure/Adapters/Repository/InvestmentsRepository';

class SignSubscriptionAgreement {
  static getClassName = (): string => 'SignSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private investmentsRepository: InvestmentsRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository, investmentsRepository: InvestmentsRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.investmentsRepository = investmentsRepository;
  }

  async execute(profileId: string, investmentId: string, clientIp: string) {
    const events: DomainEvent[] = [];
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(profileId, investmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.setSignature(clientIp);

    const isSigned = await this.subscriptionAgreementRepository.signSubscriptionAgreement(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    const id = subscriptionAgreement.getId();

    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    investment.assignSubscriptionAgreement(id);
    investment.updateStatus(InvestmentStatus.WAITING_FOR_FEES_APPROVAL);

    const isAssigned = await this.investmentsRepository.assignSubscriptionAgreementAndUpdateStatus(investment);

    if (isAssigned) {
      events.push({
        id,
        kind: 'SubscriptionAgreementSigned',
      });

      await this.investmentsRepository.publishEvents(events);
    }

    return true;
  }
}

export default SignSubscriptionAgreement;
