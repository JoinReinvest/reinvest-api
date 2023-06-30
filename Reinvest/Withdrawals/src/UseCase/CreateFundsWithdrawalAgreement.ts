import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsFundsRequestsAgreementsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequestsAgreement';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';

export type FundsWithdrawalAgreementAgreementCreate = {
  accountId: UUID;
  contentFieldsJson: DictionaryType;
  dateCreated: Date;
  fundsRequestId: UUID;
  id: UUID;
  profileId: UUID;
  status: WithdrawalsFundsRequestsAgreementsStatuses;
  templateVersion: number;
};
const mockedContentFieldsJson = {
  dateOfBirth: '03/24/2023',
  email: 'john.smith@gmail.com',
  fullName: 'John Smith',
  telephoneNumber: '+17778887775',
};

export class CreateFundsWithdrawalAgreement {
  private idGenerator: IdGenerator;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;

  constructor(
    idGenerator: IdGenerator,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
  ) {
    this.idGenerator = idGenerator;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
  }

  static getClassName = () => 'CreateFundsWithdrawalAgreement';

  async execute(profileId: UUID, accountId: UUID): Promise<void | never> {
    const pendingFundsRequest = await this.fundsWithdrawalRequestsRepository.getPendingWithdrawalRequest(profileId, accountId);

    if (!pendingFundsRequest || !pendingFundsRequest.isDraft()) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    const alreadyCreatedAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(pendingFundsRequest.getId());

    if (alreadyCreatedAgreement) {
      return;
    }

    const id = this.idGenerator.createUuid();
    const fundsWithdrawalRequestId = pendingFundsRequest.getId();

    const agreement: FundsWithdrawalAgreementAgreementCreate = {
      id,
      accountId,
      profileId,
      fundsRequestId: fundsWithdrawalRequestId,
      dateCreated: new Date(),
      status: WithdrawalsFundsRequestsAgreementsStatuses.WAITING_FOR_SIGNATURE,
      contentFieldsJson: mockedContentFieldsJson,
      templateVersion: 1,
    };

    const status = await this.fundsWithdrawalRequestsAgreementsRepository.create(agreement);

    if (!status) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }
  }
}
