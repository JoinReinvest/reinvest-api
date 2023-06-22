import { DictionaryType } from 'HKEKTypes/Generics';
import TemplateParser from 'Investments/Application/Service/TemplateParser';
import { DomainEvent } from 'SimpleAggregator/Types';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { fundsWithdrawalAgreementTemplate } from 'Withdrawals/Domain/FundsWithdrawalRequest/agreementsTemplate';
import { FundsWithdrawalAgreementTemplateVersions, PdfTypes } from 'Withdrawals/Domain/FundsWithdrawalRequest/types';

class SignFundsWithdrawalRequestAgreement {
  static getClassName = (): string => 'SignFundsWithdrawalRequestAgreement';

  private readonly fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
  ) {
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  async execute(profileId: string, accountId: string, clientIp: string) {
    const events: DomainEvent[] = [];
    const fundsWithdrawalRequestsAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(profileId, accountId);

    if (!fundsWithdrawalRequestsAgreement) {
      return false;
    }

    fundsWithdrawalRequestsAgreement.setSignature(clientIp);

    const isSigned = await this.fundsWithdrawalRequestsAgreementsRepository.updateFundsWithdrawalRequestAgreement(fundsWithdrawalRequestsAgreement);

    if (!isSigned) {
      return false;
    }

    const fundsWithdrawalRequestAgreementId = fundsWithdrawalRequestsAgreement.getId();

    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.getDraft(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      return false;
    }

    fundsWithdrawalRequest.assignAgreement(fundsWithdrawalRequestAgreementId);

    const isAssigned = await this.fundsWithdrawalRequestsRepository.assignAgreement(profileId, accountId, fundsWithdrawalRequest);

    if (isAssigned) {
      // TODO this is separate use case!
      const { contentFieldsJson, templateVersion } = fundsWithdrawalRequestsAgreement.getDataForParser();

      const parser = new TemplateParser(fundsWithdrawalAgreementTemplate[templateVersion as FundsWithdrawalAgreementTemplateVersions]);
      const parsedTemplated = parser.parse(contentFieldsJson as DictionaryType);

      // await this.documentsService.generatePdf(profileId, id, parsedTemplated, PdfTypes.AGREEMENT);

      events.push({
        id: fundsWithdrawalRequestAgreementId,
        kind: 'SubscriptionAgreementSigned',
      });

      const pdfCommand: DomainEvent = {
        id: fundsWithdrawalRequestAgreementId,
        kind: 'GeneratePdfCommand',
        data: {
          catalog: profileId,
          fileName: fundsWithdrawalRequestAgreementId,
          template: parsedTemplated,
          templateType: PdfTypes.AGREEMENT,
        },
      };

      events.push(pdfCommand);

      // await this.fundsWithdrawalRequestsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default SignFundsWithdrawalRequestAgreement;
