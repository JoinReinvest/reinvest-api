import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';

export enum SharesChangeState {
  FUNDED = SharesStatus.FUNDED,
  FUNDING = SharesStatus.FUNDING,
  SETTLED = SharesStatus.SETTLED,
  REVOKED = SharesStatus.REVOKED,
}

export class ChangeSharesState {
  private sharesRepository: SharesRepository;
  private transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>;
  private idGenerator: IdGeneratorInterface;
  private financialOperationRepository: FinancialOperationsRepository;

  constructor(
    sharesRepository: SharesRepository,
    idGenerator: IdGeneratorInterface,
    financialOperationRepository: FinancialOperationsRepository,
    transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>,
  ) {
    this.sharesRepository = sharesRepository;
    this.idGenerator = idGenerator;
    this.financialOperationRepository = financialOperationRepository;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = () => 'ChangeSharesState';

  async execute(
    investmentId: string,
    state: SharesChangeState,
    data?: {
      shares: number;
      unitPrice: number;
    },
  ): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByInvestmentId(investmentId);

      if (!shares) {
        throw new Error(`Shares with investmentId ${investmentId} not found`);
      }

      if (state === SharesChangeState.FUNDING && data !== undefined) {
        const { profileId, accountId, portfolioId } = shares.toObject();
        await this.transactionAdapter.transaction(`Update shares record for investment ${investmentId} in account ${accountId} to FUNDING state`, async () => {
          shares.setFundingState(data.shares, data.unitPrice);
          const financialOperationId = this.idGenerator.createUuid();
          await this.financialOperationRepository.addInvestmentOperation(
            financialOperationId,
            profileId,
            accountId,
            portfolioId,
            data.shares,
            data.unitPrice,
            investmentId,
          );
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
    } catch (error) {
      console.error('[ChangeSharesState]', investmentId, state, error);
    }
  }
}
