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

class CreatePayoutDocument {
  static getClassName = (): string => 'CreatePayoutDocument';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;

  constructor(withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
  }

  async execute(id: UUID, type: WithdrawalsDocumentsTypes, list: UUIDsList) {
    const events: DomainEvent[] = [];

    if (!list.list.length) {
      return true;
    }

    const contentFieldsJson = MOCK_PAYOUT_CONTENT_FIELDS;

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

export default CreatePayoutDocument;
