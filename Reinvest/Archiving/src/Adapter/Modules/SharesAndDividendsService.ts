import { SharesAndDividends } from 'SharesAndDividends/index';

export class SharesAndDividendsService {
  private sharesAndDividendsModule: SharesAndDividends.Main;
  static getClassName = (): string => 'SharesAndDividendsService';

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }
}
