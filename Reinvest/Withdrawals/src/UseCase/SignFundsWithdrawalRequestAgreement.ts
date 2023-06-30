import { DictionaryType } from 'HKEKTypes/Generics';
import TemplateParser from 'Investments/Application/Service/TemplateParser';
import { DomainEvent } from 'SimpleAggregator/Types';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
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
    const fundsRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    if (fundsRequest.isAgreementAssigned()) {
      throw new Error(WithdrawalError.WITHDRAWAL_AGREEMENT_ALREADY_SIGNED);
    }

    const fundsWithdrawalRequestsAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(fundsRequest.getId());

    if (!fundsWithdrawalRequestsAgreement) {
      throw new Error(WithdrawalError.NO_WITHDRAWAL_AGREEMENT);
    }

    fundsWithdrawalRequestsAgreement.signAgreement(clientIp);

    const isSigned = await this.fundsWithdrawalRequestsAgreementsRepository.updateFundsWithdrawalRequestAgreement(fundsWithdrawalRequestsAgreement);

    if (!isSigned) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }

    fundsRequest.assignAgreement(fundsWithdrawalRequestsAgreement.getId());
    const isAssigned = await this.fundsWithdrawalRequestsRepository.assignAgreement(fundsRequest);

    if (!isAssigned) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }

    // TODO this is separate use case!
    const { contentFieldsJson, templateVersion } = fundsWithdrawalRequestsAgreement.getDataForParser();

    const parser = new TemplateParser(fundsWithdrawalAgreementTemplate[templateVersion as FundsWithdrawalAgreementTemplateVersions]);
    const parsedTemplated = parser.parse(contentFieldsJson as DictionaryType);

    events.push({
      id: fundsWithdrawalRequestsAgreement.getId(),
      kind: 'WithdrawalAgreementSigned',
    });

    const pdfCommand: DomainEvent = {
      id: fundsWithdrawalRequestsAgreement.getId(),
      kind: 'GeneratePdfCommand',
      data: {
        catalog: profileId,
        fileName: fundsWithdrawalRequestsAgreement.getId(),
        template: parsedTemplated,
        templateType: PdfTypes.AGREEMENT,
      },
    };

    events.push(pdfCommand);

    await this.fundsWithdrawalRequestsRepository.publishEvents(events);
  }
}

export default SignFundsWithdrawalRequestAgreement;
