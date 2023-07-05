import { Money } from 'Money/Money';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';
import { FinancialOperationType } from 'SharesAndDividends/Domain/Stats/EVSDataPointsCalculatonService';

export enum SharesChangeState {
  FUNDED = SharesStatus.FUNDED,
  FUNDING = SharesStatus.FUNDING,
  SETTLED = SharesStatus.SETTLED,
  REVOKED = SharesStatus.REVOKED,
}

export class ChangeSharesState {
  private sharesRepository: SharesRepository;
  private transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>;
  private financialOperationRepository: FinancialOperationsRepository;

  constructor(
    sharesRepository: SharesRepository,
    financialOperationRepository: FinancialOperationsRepository,
    transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>,
  ) {
    this.sharesRepository = sharesRepository;
    this.financialOperationRepository = financialOperationRepository;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = () => 'ChangeSharesState';

  async execute(
    originId: string,
    state: SharesChangeState,
    data?: {
      shares: number;
      unitPrice: number;
    },
  ): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByOriginId(originId);

      if (!shares) {
        throw new Error(`Shares with originId ${originId} not found`);
      }

      if (state === SharesChangeState.FUNDING && data !== undefined) {
        const { profileId, accountId, portfolioId } = shares.toObject();
        await this.transactionAdapter.transaction(`Update shares record for originId ${originId} in account ${accountId} to FUNDING state`, async () => {
          shares.setFundingState(data.shares, Money.lowPrecision(data.unitPrice));
          await this.financialOperationRepository.addFinancialOperations([
            {
              operationType: FinancialOperationType.INVESTMENT,
              profileId,
              accountId,
              portfolioId,
              numberOfShares: data.shares,
              unitPrice: data.unitPrice,
              originId,
            },
          ]);
          await this.sharesRepository.store(shares);
        });
      }

      if (state === SharesChangeState.FUNDED) {
        shares.setFundedState();
        await this.sharesRepository.store(shares);
      }

      if (state === SharesChangeState.SETTLED) {
        shares.setSettledState();
        await this.sharesRepository.store(shares);
      }

      if (state === SharesChangeState.REVOKED) {
        shares.setRevokedState();
        await this.sharesRepository.store(shares);
        // const financialOperationId = this.idGenerator.createUuid();
        // await this.financialOperationRepository.addFinancialOperation(
        //   FinancialOperationType.REVOKED,
        //   financialOperationId,
        //   profileId,
        //   accountId,
        //   portfolioId,
        //   data.shares,
        //   data.unitPrice,
        //   investmentId,
        // );
      }
    } catch (error) {
      console.error('[ChangeSharesState]', originId, state, error);
    }
  }
}
