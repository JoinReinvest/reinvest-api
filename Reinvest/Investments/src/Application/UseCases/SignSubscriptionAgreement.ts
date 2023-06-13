import TemplateParser from 'Investments/Application/Service/TemplateParser';
import { InvestmentStatus } from 'Investments/Domain/Investments/Types';
import { subscriptionAgreementsTemplate } from 'Investments/Domain/SubscriptionAgreements/subscriptionAgreementsTemplates';
import { DynamicType, PdfTypes, SubscriptionAgreementTemplateVersions } from 'Investments/Domain/SubscriptionAgreements/types';
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
      const { contentFieldsJson, templateVersion } = subscriptionAgreement.getDataForParser();

      const parser = new TemplateParser(subscriptionAgreementsTemplate[templateVersion as SubscriptionAgreementTemplateVersions]);

      const parsed = parser.parse(contentFieldsJson as DynamicType);

      await this.documentsService.generatePdf(profileId, id, parsed, PdfTypes.AGREEMENT);

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
