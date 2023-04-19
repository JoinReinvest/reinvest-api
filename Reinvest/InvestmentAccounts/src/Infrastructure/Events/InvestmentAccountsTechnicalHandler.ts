import { ContainerInterface } from 'Container/Container';

export type InvestmentAccountsTechnicalHandlerType = {
  ProfileCreated: () => void;
};

export const investmentAccountsTechnicalHandler = (container: ContainerInterface): InvestmentAccountsTechnicalHandlerType => ({
  ProfileCreated: (): void => {
    console.log('profile created testss - investment accounts');
  },
});
