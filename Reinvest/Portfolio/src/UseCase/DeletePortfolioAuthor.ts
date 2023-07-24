import { UUID } from 'HKEKTypes/Generics';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { ValidationErrorEnum, ValidationErrorType } from 'Portfolio/Domain/Validation';

export class DeletePortfolioAuthor {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;

  constructor(portfolioAuthorsRepository: PortfolioAuthorsRepository) {
    this.portfolioAuthorsRepository = portfolioAuthorsRepository;
  }

  public static getClassName = (): string => 'DeletePortfolioAuthor';

  public async execute(id: UUID): Promise<ValidationErrorType[]> {
    const errors: ValidationErrorType[] = [];

    if (!id) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.EMPTY_VALUE,
        field: 'id',
      });

      return errors;
    }

    await this.portfolioAuthorsRepository.delete(id);

    return errors;
  }
}
