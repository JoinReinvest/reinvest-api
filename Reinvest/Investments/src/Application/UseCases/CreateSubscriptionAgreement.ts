import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes } from 'Investments/Domain/Investments/Types';
import { SubscriptionAgreementDataCollector } from 'Investments/Infrastructure/Adapters/Modules/SubscriptionAgreementDataCollector';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DateTime } from 'Money/DateTime';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';

class CreateSubscriptionAgreement {
  static getClassName = (): string => 'CreateSubscriptionAgreement';

  private subscriptionAgreementDataCollector: SubscriptionAgreementDataCollector;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    investmentsRepository: InvestmentsRepository,
    subscriptionAgreementDataCollector: SubscriptionAgreementDataCollector,
    idGenerator: IdGeneratorInterface,
  ) {
    this.subscriptionAgreementDataCollector = subscriptionAgreementDataCollector;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: UUID, investmentId: UUID) {
    const alreadyCreatedSubscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(
      profileId,
      investmentId,
      AgreementTypes.DIRECT_DEPOSIT,
    );

    if (alreadyCreatedSubscriptionAgreement) {
      return alreadyCreatedSubscriptionAgreement.getId();
    }

    const id = this.idGenerator.createUuid();
    const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

    if (!investment) {
      return false;
    }

    const dateOfAgreement = DateTime.now();
    const { portfolioId, accountId, amount } = investment.toObject();

    const collectedFields = await this.subscriptionAgreementDataCollector.collectData(portfolioId, profileId, accountId);

    const contentFields = <LatestTemplateContentFields[Templates.SUBSCRIPTION_AGREEMENT]>{
      ...collectedFields,
      investedAmount: amount.getFormattedAmount(),
      dateOfAgreement: DateTime.now().toFormattedDate('MM/DD/YYYY'),
      ipAddress: '',
      signingTimestamp: '',
      signingDate: '',
      unitPrice: investment.getFormattedUnitPrice(),
    };
    const subscriptionAgreement = SubscriptionAgreement.createForInvestment(id, profileId, accountId, investmentId, dateOfAgreement, contentFields);
    await this.subscriptionAgreementRepository.store(subscriptionAgreement);

    return id;
  }
}

export default CreateSubscriptionAgreement;
