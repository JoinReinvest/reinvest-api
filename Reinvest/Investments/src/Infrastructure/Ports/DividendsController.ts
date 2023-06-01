import { ReinvestDividend } from 'Investments/Application/UseCases/ReinvestDividend';

export class DividendsController {
  private reinvestDividendUseCase: ReinvestDividend;

  constructor(reinvestDividendUseCase: ReinvestDividend) {
    this.reinvestDividendUseCase = reinvestDividendUseCase;
  }

  public static getClassName = (): string => 'DividendsController';

  async reinvestDividends(profileId: string, accountId: string, portfolioId: string, dividendIds: string): Promise<boolean> {
    const statuses = [];

    for (const dividendId of dividendIds) {
      statuses.push(await this.reinvestDividendUseCase.execute(profileId, accountId, portfolioId, dividendId));
    }

    return statuses.some(status => status === true);
  }
}
