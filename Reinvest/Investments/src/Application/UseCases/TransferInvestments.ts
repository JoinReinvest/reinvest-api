import { UUID } from "HKEKTypes/Generics";
import { IdGeneratorInterface } from "IdGenerator/IdGenerator";
import { SharesAndDividendService } from "Investments/Infrastructure/Adapters/Modules/SharesAndDividendService";
import { InvestmentsRepository } from "Investments/Infrastructure/Adapters/Repository/InvestmentsRepository";

// from id to id
export type TransferredInvestments = {
  newInvestmentId: UUID;
  previousInvestmentId: UUID;
};

export class TransferInvestments {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository, sharesAndDividendsService: SharesAndDividendService, idGenerator: IdGeneratorInterface) {
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.idGenerator = idGenerator;
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'TransferInvestments';
  private sharesAndDividendsService: SharesAndDividendService;
  private idGenerator: IdGeneratorInterface;

  async execute(profileId: UUID, transferFromAccountId: UUID, transferToAccountId: UUID): Promise<TransferredInvestments[]> {
    const investments = await this.investmentsRepository.getAllInvestmentsWithoutFees(profileId, transferFromAccountId);

    const transferredInvestments = <TransferredInvestments[]>[];
    const toStore = [];

    for (const investment of investments) {
      if (investment.isTransferred()) {
        transferredInvestments.push({
          previousInvestmentId: investment.getOriginId(),
          newInvestmentId: investment.getId(),
        });
        continue;
      }

      const investmentTransferId = this.idGenerator.createUuid();
      const currentInvestmentId = investment.getId();
      const transferredInvestment = investment.transferInvestment(investmentTransferId, transferToAccountId);
      transferredInvestments.push({
        previousInvestmentId: currentInvestmentId,
        newInvestmentId: investmentTransferId,
      });

      toStore.push(transferredInvestment);
      toStore.push(investment);
    }

    if (toStore.length > 0) {
      await this.investmentsRepository.transferInvestments(toStore);
    }

    return transferredInvestments;
  }
}
