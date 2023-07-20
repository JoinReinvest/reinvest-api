import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
import { WithdrawalsDocuments, WithdrawalsDocumentsEvents } from 'Withdrawals/Domain/WithdrawalsDocuments';

const MOCK_REDEMPTION_CONTENT_FIELDS = {
  issuerName: 'Reinvest corp.',
  assetName: 'Community REIT',
  authorizedRepresentativeName: 'Brandon Rule',
  date: '07/20/2023',
  data: [
    {
      securityName: 'SecurityName 1', // portfolio
      unitPrice: 'unitPrice 1', // sad
      securityholderName: 'securityholderName 1', // profile name
      securityholderEmail: 'securityholderEmail 1', // can be beneficiary! - registration/mapping_registry
      currentDistributionUnits: 1, // sad/number of shares
      newDistributionUnits: 0,
      dateOfRedemption: 'dateOfRedemption 1', // withdrawal date
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

class CreateRedemptionFormDocument {
  static getClassName = (): string => 'CreateRedemptionFormDocument';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;
  private withdrawalsRepository: WithdrawalsRepository;
  private withdrawalCollector: WithdrawalDocumentsDataCollector;

  constructor(
    withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository,
    withdrawalsRepository: WithdrawalsRepository,
    withdrawalCollector: WithdrawalDocumentsDataCollector,
  ) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
    this.withdrawalsRepository = withdrawalsRepository;
    this.withdrawalCollector = withdrawalCollector;
  }

  async execute(withdrawalId: UUID): Promise<void> {
    const withdrawal = await this.withdrawalsRepository.getById(withdrawalId);

    if (!withdrawal) {
      throw new Error(`Withdrawal with id ${withdrawalId} not found`);
    }

    const { documentId, listOfWithdrawals } = withdrawal.getRedemptions();

    if (!documentId || listOfWithdrawals.list.length === 0) {
      return;
    }

    // const existingDocument = await this.withdrawalsDocumentsRepository.getById(documentId);

    // if (existingDocument) {
    //   // fallback if document exist - sending event push generating document pdf
    //   if (!existingDocument.isGenerated()) {
    //     await this.sendEvent(documentId);
    //   }
    //
    //   return;
    // }

    const contentFields = MOCK_REDEMPTION_CONTENT_FIELDS;
    const withdrawalDocument = WithdrawalsDocuments.createRedemptions(documentId, withdrawalId, contentFields);

    const status = await this.withdrawalsDocumentsRepository.store(withdrawalDocument);

    if (!status) {
      throw new Error(`Withdrawal redemption document with id ${documentId} not created`);
    }

    await this.sendEvent(documentId);
  }

  async sendEvent(documentId: UUID) {
    await this.withdrawalsDocumentsRepository.publishEvents([
      {
        id: documentId,
        kind: WithdrawalsDocumentsEvents.WithdrawalsDocumentCreated,
        data: {},
      },
    ]);
  }
}

export default CreateRedemptionFormDocument;
