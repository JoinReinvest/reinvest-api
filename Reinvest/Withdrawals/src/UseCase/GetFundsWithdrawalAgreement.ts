import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { fundsWithdrawalAgreementTemplate } from 'Withdrawals/Domain/FundsWithdrawalRequest/agreementsTemplate';
import { FundsWithdrawalAgreementTemplateVersions } from 'Withdrawals/Domain/FundsWithdrawalRequest/types';
import TemplateParser from 'Withdrawals/Service/TemplateParser';

class GetFundsWithdrawalAgreement {
  static getClassName = (): string => 'GetFundsWithdrawalAgreement';

  private readonly fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
  ) {
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  async execute(profileId: UUID, accountId: UUID) {
    const fundsRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    const agreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(fundsRequest.getId());

    if (!agreement) {
      throw new Error(WithdrawalError.NO_WITHDRAWAL_AGREEMENT);
    }

    const { contentFieldsJson, templateVersion, id, status, dateCreated, signedAt } = agreement.toObject();
    const parser = new TemplateParser(fundsWithdrawalAgreementTemplate[templateVersion as FundsWithdrawalAgreementTemplateVersions]);
    const parsed = parser.parse(contentFieldsJson as DictionaryType);

    return {
      id,
      status,
      createdAt: dateCreated,
      signedAt,
      content: parsed,
    };
  }
}

export default GetFundsWithdrawalAgreement;
