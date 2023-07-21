import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
import { WithdrawalSharesView } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { UUIDsList } from 'Withdrawals/Domain/Withdrawal';
import { WithdrawalsDocuments, WithdrawalsDocumentsEvents } from 'Withdrawals/Domain/WithdrawalsDocuments';

export type SharesRecord = WithdrawalSharesView & {
  holderEmail: string;
  holderName: string;
};

class CreateRedemptionFormDocument {
  static getClassName = (): string => 'CreateRedemptionFormDocument';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;
  private withdrawalsRepository: WithdrawalsRepository;
  private withdrawalCollector: WithdrawalDocumentsDataCollector;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository,
    withdrawalsRepository: WithdrawalsRepository,
    withdrawalCollector: WithdrawalDocumentsDataCollector,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
  ) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
    this.withdrawalsRepository = withdrawalsRepository;
    this.withdrawalCollector = withdrawalCollector;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  async execute(withdrawalId: UUID): Promise<void> {
    const withdrawal = await this.withdrawalsRepository.getById(withdrawalId);

    if (!withdrawal) {
      throw new Error(`Withdrawal with id ${withdrawalId} not found`);
    }

    const { documentId, listOfWithdrawals } = withdrawal.forRedemptions();

    if (!documentId || listOfWithdrawals.list.length === 0) {
      return;
    }

    const existingDocument = await this.withdrawalsDocumentsRepository.getById(documentId);

    if (existingDocument) {
      // fallback if document exist - sending event push generating document pdf
      if (!existingDocument.isGenerated()) {
        await this.sendEvent(documentId);
      }

      return;
    }

    const contentFields = await this.prepareContentFields(listOfWithdrawals);
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

  private async prepareContentFields(listOfWithdrawals: UUIDsList): Promise<LatestTemplateContentFields[Templates.REDEMPTION_FORM]> {
    const withdrawalsRequests = await this.fundsWithdrawalRequestsRepository.getFundsWithdrawalsRequests(listOfWithdrawals.list);
    let withdrawalSharesViews: WithdrawalSharesView[] = [];
    withdrawalsRequests.forEach(request => {
      withdrawalSharesViews = [...withdrawalSharesViews, ...request.getWithdrawalSharesView()];
    });

    withdrawalSharesViews = await this.mapSharesOriginalOwners(withdrawalSharesViews);
    const sharesRecords = await this.mapAccountsData(withdrawalSharesViews);
    const assetName = await this.withdrawalCollector.getAssetName();

    return {
      assetName,
      date: DateTime.now().toFormattedDate('MM/DD/YYYY'),
      data: sharesRecords.map(record => ({
        securityName: assetName,
        unitPrice: record.unitPrice.getFormattedAmount(),
        securityHolderName: record.holderName,
        securityHolderEmail: record.holderEmail,
        currentDistributionUnits: record.numberOfShares,
        newDistributionUnits: 0,
        dateOfRedemption: record.redemptionDate.toFormattedDate('MM/DD/YYYY'),
      })),
    };
  }

  private async mapSharesOriginalOwners(withdrawalSharesViews: WithdrawalSharesView[]): Promise<WithdrawalSharesView[]> {
    const sharesIds = withdrawalSharesViews.map(record => record.sharesId);
    const sharesOriginalOwners = await this.withdrawalCollector.getSharesOriginalOwners(sharesIds);

    return withdrawalSharesViews.map(share => {
      if (sharesOriginalOwners[share.sharesId]) {
        return {
          ...share,
          accountId: sharesOriginalOwners[share.sharesId]!,
        };
      }

      return share;
    });
  }

  private async mapAccountsData(withdrawalSharesViews: WithdrawalSharesView[]): Promise<SharesRecord[]> {
    const accountsIds: UUID[] = [];
    const profileIds: UUID[] = [];
    withdrawalSharesViews.forEach(record => {
      if (!accountsIds.includes(record.accountId)) {
        accountsIds.push(record.accountId);
      }

      if (!profileIds.includes(record.profileId)) {
        profileIds.push(record.profileId);
      }
    });

    const accountsEmail = await this.withdrawalCollector.getAccountsEmails(accountsIds);
    const profilesData = await this.withdrawalCollector.getProfilesNames(profileIds);

    return withdrawalSharesViews.map((share): SharesRecord => {
      if (!accountsEmail[share.accountId] || !profilesData[share.profileId]) {
        console.error('Missing data for redemption form for profile/account', share);

        throw new Error('Missing data for redemption form');
      }

      const holderEmail = accountsEmail![share.accountId]!;
      const holderName = profilesData![share.profileId]!;

      return {
        ...share,
        holderEmail,
        holderName,
      };
    });
  }
}

export default CreateRedemptionFormDocument;
