import { ContainerInterface } from 'Container/Container';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';

export type VerificationApiType = {
  verifyAccount: VerifyAccount['verify'];
};

export const verificationApi = (container: ContainerInterface): VerificationApiType => ({
  verifyAccount: container.delegateTo(VerifyAccount, 'verify'),
});
