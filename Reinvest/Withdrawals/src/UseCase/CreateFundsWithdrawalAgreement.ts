import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { Template } from 'Templates/Template';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
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

export class CreateFundsWithdrawalAgreement {
  private idGenerator: IdGenerator;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;
  private withdrawalDocumentsDataCollector: WithdrawalDocumentsDataCollector;

  constructor(
    idGenerator: IdGenerator,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
    withdrawalDocumentsDataCollector: WithdrawalDocumentsDataCollector,
  ) {
    this.idGenerator = idGenerator;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
    this.withdrawalDocumentsDataCollector = withdrawalDocumentsDataCollector;
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

    const templateVersion = Template.getLatestTemplateVersion(Templates.SUBSCRIPTION_AGREEMENT);
    const collectedData = await this.withdrawalDocumentsDataCollector.collectDataForWithdrawalAgreement(profileId, accountId);

    const { date, shareCount, withdrawalAmount } = pendingFundsRequest.getWithdrawalDetails();

    const contentFields = <LatestTemplateContentFields[Templates.WITHDRAWAL_AGREEMENT]>{
      ...collectedData,
      date: date.toFormattedDate('MM/DD/YYYY'),
      shareCount,
      withdrawalAmount,
      ipAddress: '',
      signingTimestamp: '',
      signingDate: '',
    };

    const agreement: FundsWithdrawalAgreementAgreementCreate = {
      id,
      accountId,
      profileId,
      fundsRequestId: fundsWithdrawalRequestId,
      dateCreated: DateTime.now().toDate(),
      status: WithdrawalsFundsRequestsAgreementsStatuses.WAITING_FOR_SIGNATURE,
      contentFieldsJson: contentFields,
      templateVersion,
    };

    const status = await this.fundsWithdrawalRequestsAgreementsRepository.create(agreement);

    if (!status) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }
  }
}
