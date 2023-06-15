import { SharesAndDividends } from 'SharesAndDividends/index';

/**
 * SharesAndDividends Module ACL
 */
export class SharesAndDividendsDocumentService {
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = () => 'SharesAndDividendsDocumentService';
}
