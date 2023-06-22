import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsFundsRequestsAgreementsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequestsAgreement';

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

  async execute(profileId: UUID, accountId: UUID) {
    const alreadyCreatedAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(profileId, accountId);

    if (alreadyCreatedAgreement) {
      const id = alreadyCreatedAgreement.getId();

      return id;
    }

    const id = this.idGenerator.createUuid();

    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.getDraft(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      return false;
    }

    const fundsWithdrawalRequestId = fundsWithdrawalRequest.getId();

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
      return false;
    }

    return id;
  }
}
