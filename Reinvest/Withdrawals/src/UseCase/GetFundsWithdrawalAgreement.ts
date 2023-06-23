import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { fundsWithdrawalAgreementTemplate } from 'Withdrawals/Domain/FundsWithdrawalRequest/agreementsTemplate';
import { FundsWithdrawalAgreementTemplateVersions } from 'Withdrawals/Domain/FundsWithdrawalRequest/types';
import TemplateParser from 'Withdrawals/Service/TemplateParser';

class GetFundsWithdrawalAgreement {
  static getClassName = (): string => 'GetFundsWithdrawalAgreement';

  private readonly fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;

  constructor(fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository) {
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
  }

  async execute(profileId: UUID, accountId: UUID, ) {
    const subscriptionAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(profileId, accountId);

    if (!subscriptionAgreement) {
      return false;
    }

    const { contentFieldsJson, templateVersion, id, status, dateCreated, signedAt } = subscriptionAgreement.toObject();

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
