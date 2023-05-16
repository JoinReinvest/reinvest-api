import { ContainerInterface } from 'Container/Container';

export type InvestmentsTechnicalHandlerType = {
  ProfileCreated: () => void;
};

export const investmentsTechnicalHandler = (container: ContainerInterface): InvestmentsTechnicalHandlerType => ({
  ProfileCreated: (): void => {
    console.log('profile created testss - investment accounts');
  },
});
