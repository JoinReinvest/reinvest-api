import { ContainerInterface } from 'Container/Container';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';

import { InvestmentsController } from './InvestmentsController';

export type InvestmentsApiType = {
  createInvestment: InvestmentsController['createInvestment'];
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
});
