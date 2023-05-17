import { ContainerInterface } from 'Container/Container';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';

export type InvestmentsApiType = {
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
});
