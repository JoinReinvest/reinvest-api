import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes } from 'Investments/Domain/Investments/Types';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DomainEvent } from 'SimpleAggregator/Types';

class SignSubscriptionAgreement {
  static getClassName = (): string => 'SignSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private investmentsRepository: InvestmentsRepository;
  private documentsService: DocumentsService;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    investmentsRepository: InvestmentsRepository,
    documentsService: DocumentsService,
  ) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.investmentsRepository = investmentsRepository;
    this.documentsService = documentsService;
  }

  async execute(profileId: string, investmentId: string, clientIp: string) {
    const events: DomainEvent[] = [];
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(
      profileId,
      investmentId,
      AgreementTypes.DIRECT_DEPOSIT,
    );

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.sign(clientIp);
    const isSigned = await this.subscriptionAgreementRepository.store(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    const id = subscriptionAgreement.getId();
    const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

    if (!investment) {
      return false;
    }

    investment.assignSubscriptionAgreement(id);
    const isAssigned = await this.investmentsRepository.store(investment);

    if (isAssigned) {
      events.push(<SubscriptionAgreementEvent>{
        id,
        kind: SubscriptionAgreementEvents.SubscriptionAgreementSigned,
        data: {
          profileId,
        },
      });

      await this.investmentsRepository.publishEvents(events);
    }

    return true;
  }
}

export default SignSubscriptionAgreement;
