import { UUID } from 'HKEKTypes/Generics';
import { ValidationErrorEnum, ValidationErrorType } from 'Portfolio/Domain/Validation';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';

export class CreatePortfolioUpdate {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;

  constructor(portfolioRepository: PortfolioUpdatesRepository) {
    this.portfolioUpdatesRepository = portfolioRepository;
  }

  public static getClassName = (): string => 'CreatePortfolioUpdate';

  public async execute(portfolioId: UUID): Promise<ValidationErrorType[]> {
    const errors: ValidationErrorType[] = [];

    if (!portfolioId) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.EMPTY_VALUE,
        field: 'portfolioId',
      });

      return errors;
    }

    await this.portfolioUpdatesRepository.add(portfolioId);

    return errors;
  }
}
