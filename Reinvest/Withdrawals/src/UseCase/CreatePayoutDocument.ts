import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
import { UUIDsList } from 'Withdrawals/Domain/Withdrawal';
import { WithdrawalsDocuments, WithdrawalsDocumentsEvents } from 'Withdrawals/Domain/WithdrawalsDocuments';

class CreatePayoutDocument {
  static getClassName = (): string => 'CreatePayoutDocument';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;
  private withdrawalsRepository: WithdrawalsRepository;
  private withdrawalCollector: WithdrawalDocumentsDataCollector;
  private dividendsRequestsRepository: DividendsRequestsRepository;
  private fundsRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository,
    withdrawalsRepository: WithdrawalsRepository,
    withdrawalCollector: WithdrawalDocumentsDataCollector,
    dividendsRequestsRepository: DividendsRequestsRepository,
    fundsRequestsRepository: FundsWithdrawalRequestsRepository,
  ) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
    this.withdrawalsRepository = withdrawalsRepository;
    this.withdrawalCollector = withdrawalCollector;
    this.dividendsRequestsRepository = dividendsRequestsRepository;
    this.fundsRequestsRepository = fundsRequestsRepository;
  }

  async execute(withdrawalId: UUID) {
    const withdrawal = await this.withdrawalsRepository.getById(withdrawalId);

    if (!withdrawal) {
      throw new Error(`Withdrawal with id ${withdrawalId} not found`);
    }

    const { documentId, listOfWithdrawals, listOfDividends } = withdrawal.forPayouts();

    if (!documentId || (listOfWithdrawals.list.length === 0 && listOfDividends.list.length === 0)) {
      return;
    }

    const existingDocument = await this.withdrawalsDocumentsRepository.getById(documentId);

    if (existingDocument) {
      if (!existingDocument.isGenerated()) {
        // fallback if document exist - sending event push generating document pdf
        await this.sendEvent(documentId);
      }

      return;
    }

    const contentFields = await this.prepareContentFields(listOfWithdrawals, listOfDividends);
    const withdrawalDocument = WithdrawalsDocuments.createPayout(documentId, withdrawalId, contentFields);
    const status = await this.withdrawalsDocumentsRepository.store(withdrawalDocument);

    if (!status) {
      throw new Error(`Withdrawal payout document with id ${documentId} not created`);
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

  private async prepareContentFields(listOfWithdrawals: UUIDsList, listOfDividends: UUIDsList): Promise<LatestTemplateContentFields[Templates.PAYOUT]> {
    const accountToAmounts: Record<UUID, Record<UUID, Money[]>> = {};
    const profilesToAccounts: Record<UUID, UUID[]> = {};

    if (listOfWithdrawals.list.length > 0) {
      const withdrawalsRequests = await this.fundsRequestsRepository.getFundsWithdrawalsRequests(listOfWithdrawals.list);
      this.retrieveAccounts(accountToAmounts, profilesToAccounts, withdrawalsRequests);
    }

    if (listOfDividends.list.length > 0) {
      const dividendsRequests = await this.dividendsRequestsRepository.getDividendsRequests(listOfDividends.list);
      this.retrieveAccounts(accountToAmounts, profilesToAccounts, dividendsRequests);
    }

    const mappedAccounts = await this.withdrawalCollector.mapAccountsToNorthCapital(profilesToAccounts);

    const contentFieldsRecords = [];

    for (const [profileId, accounts] of Object.entries(profilesToAccounts)) {
      for (const accountId of accounts) {
        if (!mappedAccounts[accountId]) {
          console.error(`[Creating Payout Template] Bank account does not exist in North Capital for account ${accountId}. Can not withdraw funds`);
          continue;
        }

        const mappedAccount = mappedAccounts[accountId]!;
        const { profileId: mappedProfileId, ncAccountNumber, ncAccountId } = mappedAccount;

        if (profileId !== mappedProfileId) {
          console.error(`[Creating Payout Template] Bank account ${accountId} does not belong to profile ${profileId}`);
          continue;
        }

        const amount = accountToAmounts[profileId]![accountId]!.reduce((acc, amount) => acc.add(amount), Money.zero());

        contentFieldsRecords.push({
          accountId: ncAccountId,
          amount: amount.getFormattedAmount(),
          northCapitalAccountNumber: ncAccountNumber,
        });
      }
    }

    return {
      data: contentFieldsRecords,
    };
  }

  private retrieveAccounts(
    accountToAmounts: Record<UUID, Record<UUID, Money[]>>,
    profilesToAccounts: Record<UUID, UUID[]>,
    objects: {
      forPayoutTemplate(): {
        accountId: UUID;
        amount: Money;
        profileId: UUID;
      };
    }[],
  ): void {
    for (const object of objects) {
      const { profileId, accountId, amount } = object.forPayoutTemplate();

      if (!accountToAmounts[profileId]) {
        accountToAmounts[profileId] = {};
      }

      if (!accountToAmounts[profileId]![accountId]) {
        accountToAmounts[profileId]![accountId] = [];
      }

      if (!profilesToAccounts[profileId]) {
        profilesToAccounts[profileId] = [];
      }

      if (!profilesToAccounts[profileId]!.includes(accountId)) {
        profilesToAccounts[profileId]!.push(accountId);
      }

      accountToAmounts[profileId]![accountId]!.push(amount);
    }
  }
}

export default CreatePayoutDocument;
