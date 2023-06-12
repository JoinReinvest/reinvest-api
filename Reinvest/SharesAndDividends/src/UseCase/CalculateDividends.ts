import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { CalculatedDividend } from 'SharesAndDividends/Domain/CalculatingDividends/CalculatedDividend';
import { SharesToCalculate } from 'SharesAndDividends/UseCase/DividendsCalculationQuery';

export class CalculateDividends {
  private dividendsCalculationRepository: DividendsCalculationRepository;
  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(idGenerator: IdGeneratorInterface, dividendsCalculationRepository: DividendsCalculationRepository, sharesRepository: SharesRepository) {
    this.idGenerator = idGenerator;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
    this.sharesRepository = sharesRepository;
  }

  static getClassName = () => 'CalculateDividends';

  async execute(sharesToCalculate: SharesToCalculate): Promise<void> {
    const { declarationId, sharesIds } = sharesToCalculate;
    const declaration = await this.dividendsCalculationRepository.getDividendDeclarationById(declarationId);

    if (!declaration || declaration.isCalculated()) {
      throw new Error(`The dividend declaration no exists or is in CALCULATED state: ${declarationId}`);
    }

    if (sharesIds.length === 0) {
      throw new Error(`No shares to calculate`);
    }

    const shares = await this.sharesRepository.getSharesByIds(sharesIds);

    if (shares.length === 0) {
      throw new Error(`No shares found to calculate`);
    }

    const calculatedDividends: CalculatedDividend[] = [];

    for (const share of shares) {
      const { dateFunding, numberOfShares, sharesId, profileId, accountId, sharesStatus } = share.forDividendCalculation();

      if (!dateFunding || !numberOfShares) {
        console.error(`Invalid share data: ${share.getId()}`);
        continue;
      }

      const { dividendAmount, numberOfDaysInvestorOwnsShares } = declaration.calculateDividendAmountForShares(dateFunding, numberOfShares);
      const feeAmount = share.calculateFeeAmountForShares(numberOfDaysInvestorOwnsShares);
      const calculatedDividendId = this.idGenerator.createUuid();

      const calculatedDividend = CalculatedDividend.create(
        calculatedDividendId,
        dividendAmount,
        feeAmount,
        numberOfDaysInvestorOwnsShares,
        declarationId,
        accountId,
        profileId,
        sharesId,
        sharesStatus,
      );

      calculatedDividends.push(calculatedDividend);
    }

    // store calculated dividends in db
    await this.dividendsCalculationRepository.storeCalculatedDividends(calculatedDividends);
  }
}
