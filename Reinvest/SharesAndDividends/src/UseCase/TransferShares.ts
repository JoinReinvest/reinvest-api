import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { FinancialOperation, FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { FinancialOperationType } from 'SharesAndDividends/Domain/Stats/EVSDataPointsCalculatonService';

export type TransferredOrigins = {
  newId: UUID;
  previousId: UUID;
};

export type TransferredShares = {
  newShareId: UUID;
  numberOfShares: number;
  previousShareId: UUID;
  price: number;
};

export class TransferShares {
  static getClassName = () => 'TransferShares';

  private financialOperationRepository: FinancialOperationsRepository;
  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(sharesRepository: SharesRepository, financialOperationRepository: FinancialOperationsRepository, idGenerator: IdGeneratorInterface) {
    this.financialOperationRepository = financialOperationRepository;
    this.sharesRepository = sharesRepository;
    this.idGenerator = idGenerator;
  }

  async execute(
    profileId: UUID,
    transferFromAccountId: UUID,
    transferToAccountId: UUID,
    transferredOrigins: TransferredOrigins[],
  ): Promise<TransferredShares[]> {
    const shares = await this.sharesRepository.getAllAccountShares(profileId, transferFromAccountId);
    const transferredShares = <TransferredShares[]>[];
    const toStore = [];
    const financialOperations = <FinancialOperation[]>[];

    for (const share of shares) {
      if (share.isTransferred()) {
        transferredShares.push({
          previousShareId: share.getTransferredFromId(),
          newShareId: share.getId(),
          numberOfShares: share.getNumberOfShares(),
          price: share.getPrice(),
        });
        continue;
      }

      if (share.isRevoked()) {
        continue;
      }

      const currentOriginId = share.getOriginId();
      const newOriginId = transferredOrigins.find(origin => origin.previousId === currentOriginId)?.newId;

      if (!newOriginId) {
        console.error(`Missing new origin id for share transfer, share id: ${share.getId()}}`);
        continue;
      }

      const newShareTransferId = this.idGenerator.createUuid();
      const currentShareId = share.getId();
      const transferredShare = share.transferShare(newShareTransferId, transferToAccountId, newOriginId);
      transferredShares.push({
        previousShareId: currentShareId,
        newShareId: newShareTransferId,
        numberOfShares: share.getNumberOfShares(),
        price: share.getPrice(),
      });

      toStore.push(transferredShare);
      toStore.push(share);

      if (!share.isCreated()) {
        financialOperations.push({
          operationType: FinancialOperationType.TRANSFER_OUT,
          ...transferredShare.forFinancialOperation(),
        });

        financialOperations.push({
          operationType: FinancialOperationType.TRANSFER_IN,
          ...share.forFinancialOperation(),
        });
      }
    }

    if (toStore.length > 0) {
      await this.sharesRepository.transferShares(toStore);
    }

    if (financialOperations.length > 0) {
      await this.financialOperationRepository.addFinancialOperations(financialOperations);
    }

    return transferredShares;
  }
}
