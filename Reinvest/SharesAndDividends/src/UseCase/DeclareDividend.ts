import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { DividendDeclaration } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDeclaration';

export class DeclareDividend {
  private dividendsCalculationRepository: DividendsCalculationRepository;
  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(idGenerator: IdGeneratorInterface, dividendsCalculationRepository: DividendsCalculationRepository, sharesRepository: SharesRepository) {
    this.idGenerator = idGenerator;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
    this.sharesRepository = sharesRepository;
  }

  static getClassName = () => 'DeclareDividend';

  async execute(portfolioId: string, amount: Money, declarationDate: DateTime): Promise<void> {
    const lastDate = await this.dividendsCalculationRepository.getLastDeclarationDate();

    const firstSharesFundingDate = !lastDate ? await this.sharesRepository.getFirstSharesFundingDate() : null;
    const calculatedFromDate = lastDate ? lastDate.addDays(1) : firstSharesFundingDate;
    const calculatedToDate = declarationDate;

    if (calculatedToDate.isToday()) {
      throw new Error('Dividend declaration date must be an ended day (not today)');
    }

    if (calculatedToDate.isFuture()) {
      throw new Error('Dividend declaration date must be a past day (not in the future)');
    }

    if (!calculatedFromDate) {
      throw new Error('No shares created yet, so not able to specify dividend calculation start date');
    }

    if (calculatedToDate.isBeforeOrEqual(lastDate ? lastDate! : firstSharesFundingDate!)) {
      throw new Error('Dividend declaration date must be after the last dividend declaration date or the first shares created date');
    }

    const id = this.idGenerator.createUuid();

    const numberOfSharesPerDay = await this.sharesRepository.getAccumulativeNumberOfSharesPerDay(portfolioId, calculatedFromDate, calculatedToDate);
    const dividendDeclaration = DividendDeclaration.create(id, portfolioId, amount, numberOfSharesPerDay, calculatedFromDate, calculatedToDate);

    await this.dividendsCalculationRepository.storeDividendDeclaration(dividendDeclaration);
  }
}
