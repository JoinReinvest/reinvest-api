import { UUID } from 'HKEKTypes/Generics';
import { Template } from 'Templates/Template';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';

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

    const { id, status, dateCreated, signedAt } = agreement.toObject();

    const { template: templateName, content, version } = agreement.forParser();
    const template = new Template(templateName, content, version);

    return {
      id,
      status,
      createdAt: dateCreated,
      signedAt,
      content: template.toArray(),
    };
  }
}

export default GetFundsWithdrawalAgreement;
