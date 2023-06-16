import { SharesAndDividends } from 'SharesAndDividends/index';

/**
 * SharesAndDividends Module ACL
 */
export class SharesAndDividendsService {
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = () => 'SharesAndDividendsService';
}
