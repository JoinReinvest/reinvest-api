import { UUID } from 'HKEKTypes/Generics';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { ValidationErrorEnum, ValidationErrorType } from 'Portfolio/Domain/Validation';

export class DeletePortfolioUpdate {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;

  constructor(portfolioRepository: PortfolioUpdatesRepository) {
    this.portfolioUpdatesRepository = portfolioRepository;
  }

  public static getClassName = (): string => 'DeletePortfolioUpdate';

  public async execute(id: UUID): Promise<ValidationErrorType[]> {
    const errors: ValidationErrorType[] = [];

    if (!id) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.EMPTY_VALUE,
        field: 'id',
      });

      return errors;
    }

    await this.portfolioUpdatesRepository.delete(id);

    return errors;
  }
}
