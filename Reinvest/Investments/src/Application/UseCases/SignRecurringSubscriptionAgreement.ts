import TemplateParser from 'Investments/Application/Service/TemplateParser';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { recurringSubscriptionAgreementsTemplates } from 'Investments/Domain/SubscriptionAgreements/recurringSubscriptionAgreementsTemplates';
import type { DynamicType, RecurringSubscriptionAgreementTemplateVersions } from 'Investments/Domain/SubscriptionAgreements/types';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { PdfTypes } from 'Reinvest/Documents/src/Port/Api/PdfController';
import { DomainEvent } from 'SimpleAggregator/Types';

class SignRecurringSubscriptionAgreement {
  static getClassName = (): string => 'SignRecurringSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private documentsService: DocumentsService;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    documentsService: DocumentsService,
  ) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.documentsService = documentsService;
  }

  async execute(profileId: string, accountId: string, clientIp: string) {
    const events: DomainEvent[] = [];

    const recurringInvestment = await this.recurringInvestmentsRepository.get(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const recurringInvestmentId = recurringInvestment.getId();

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(profileId, recurringInvestmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.setSignature(clientIp);

    const isSigned = await this.subscriptionAgreementRepository.signSubscriptionAgreement(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    const subscriptionAgreementId = subscriptionAgreement.getId();

    recurringInvestment.assignSubscriptionAgreement(subscriptionAgreementId);

    const isAssigned = await this.recurringInvestmentsRepository.assignSubscriptionAgreementAndUpdateStatus(recurringInvestment);

    if (isAssigned) {
      const { contentFieldsJson, templateVersion } = subscriptionAgreement.getDataForParser();

      const parser = new TemplateParser(recurringSubscriptionAgreementsTemplates[templateVersion as RecurringSubscriptionAgreementTemplateVersions]);

      const parsed = parser.parse(contentFieldsJson as DynamicType);

      await this.documentsService.generatePdf(profileId, subscriptionAgreementId, parsed, PdfTypes.AGREEMENT);

      events.push({
        id: subscriptionAgreementId,
        kind: 'RecurringInvestmentSubscriptionAgreementSigned',
      });

      await this.recurringInvestmentsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default SignRecurringSubscriptionAgreement;
