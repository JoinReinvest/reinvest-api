import { ContainerInterface } from 'Container/Container';
import { VerifyAccountForInvestmentHandler } from 'Verification/Port/Queue/EventHandler/VerifyAccountForInvestmentHandler';

export type VerificationTechnicalHandlerType = {
  VerifyAccountForInvestment: VerifyAccountForInvestmentHandler['handle'];
};

export const verificationTechnicalHandler = (container: ContainerInterface): VerificationTechnicalHandlerType => ({
  VerifyAccountForInvestment: container.delegateTo(VerifyAccountForInvestmentHandler, 'handle'),
});
