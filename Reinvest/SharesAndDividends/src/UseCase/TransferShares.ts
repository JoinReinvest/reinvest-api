import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';

export type TransferredOrigins = {
  newId: UUID;
  previousId: UUID;
};

export type TransferredShares = {
  newShareId: UUID;
  previousShareId: UUID;
};

export class TransferShares {
  static getClassName = () => 'TransferShares';

  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(sharesRepository: SharesRepository, idGenerator: IdGeneratorInterface) {
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

    for (const share of shares) {
      if (share.isTransferred()) {
        transferredShares.push({
          previousShareId: share.getTransferredFromId(),
          newShareId: share.getId(),
        });
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
      });

      toStore.push(transferredShare);
      toStore.push(share);
    }

    if (toStore.length > 0) {
      await this.sharesRepository.transferShares(toStore);
    }

    return transferredShares;
  }
}
