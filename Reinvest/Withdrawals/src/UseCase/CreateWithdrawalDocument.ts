import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { UUIDsList } from 'Withdrawals/Domain/Withdrawal';
import {
  WithdrawalsDocuments,
  WithdrawalsDocumentsEvents,
  WithdrawalsDocumentsStatuses,
  WithdrawalsDocumentsTypes,
} from 'Withdrawals/Domain/WithdrawalsDocuments';

const MOCK_REDEMPTION_CONTENT_FIELDS = {
  issuerName: 'Issuer Name',
  signature: 'signature',
  authorizedRepresentativeName: 'Authorized Representative Name',
  date: 'Date',
  data: [
    {
      securityName: 'SecurityName 1',
      unitPrice: 'unitPrice 1',
      securityholderName: 'securityholderName 1',
      securityholderEmail: 'securityholderEmail 1',
      currentDistributionUnits: 1,
      newDistributionUnits: 1,
      dateOfRedemption: 'dateOfRedemption 1',
    },
    {
      securityName: 'SecurityName 2',
      unitPrice: 'unitPrice 2',
      securityholderName: 'securityholderName 2',
      securityholderEmail: 'securityholderEmail 2',
      currentDistributionUnits: 2,
      newDistributionUnits: 2,
      dateOfRedemption: 'dateOfRedemption 2',
    },
  ],
};

const MOCK_PAYOUT_CONTENT_FIELDS = {
  data: [
    {
      accountId: 'AccountId 1',
      amount: 'Amount 1',
      northCapitalAccountNumber: 'North Capital Account Number 1',
    },
    {
      accountId: 'AccountId 2',
      amount: 'Amount 2',
      northCapitalAccountNumber: 'North Capital Account Number 2',
    },
  ],
};

class CreateWithdrawalDocument {
  static getClassName = (): string => 'CreateWithdrawalDocument';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;

  constructor(withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
  }

  async execute(id: UUID, type: WithdrawalsDocumentsTypes, list: UUIDsList) {
    const events: DomainEvent[] = [];

    const contentFieldsJson = type === WithdrawalsDocumentsTypes.REDEMPTION ? MOCK_REDEMPTION_CONTENT_FIELDS : MOCK_PAYOUT_CONTENT_FIELDS;

    const withdrawalDocument = WithdrawalsDocuments.create({
      id,
      type,
      dateCreated: DateTime.now(),
      dateCompleted: null,
      status: WithdrawalsDocumentsStatuses.CREATED,
      pdfDateCreated: null,
      contentFieldsJson,
    });

    const status = this.withdrawalsDocumentsRepository.create(withdrawalDocument);

    if (!status) {
      return false;
    }

    events.push({
      id,
      kind: WithdrawalsDocumentsEvents.WithdrawalsDocumentCreated,
      data: {
        type,
      },
    });

    await this.withdrawalsDocumentsRepository.publishEvents(events);

    return true;
  }
}

export default CreateWithdrawalDocument;
