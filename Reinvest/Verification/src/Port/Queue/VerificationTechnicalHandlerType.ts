import { ContainerInterface } from 'Container/Container';
import { MarkSensitiveDataUpdatedHandler } from 'Verification/Port/Queue/EventHandler/MarkSensitiveDataUpdatedHandler';
import { VerifyAccountForInvestmentHandler } from 'Verification/Port/Queue/EventHandler/VerifyAccountForInvestmentHandler';

export type VerificationTechnicalHandlerType = {
  SensitiveDataUpdated: MarkSensitiveDataUpdatedHandler['handle'];
  VerifyAccountForInvestment: VerifyAccountForInvestmentHandler['handle'];
};

export const verificationTechnicalHandler = (container: ContainerInterface): VerificationTechnicalHandlerType => ({
  VerifyAccountForInvestment: container.delegateTo(VerifyAccountForInvestmentHandler, 'handle'),
  SensitiveDataUpdated: container.delegateTo(MarkSensitiveDataUpdatedHandler, 'handle'),
});
