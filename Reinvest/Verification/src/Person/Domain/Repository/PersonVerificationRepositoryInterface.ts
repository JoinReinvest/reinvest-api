import { PersonVerification } from '../PersonVerification';

export interface PersonVerificationRepositoryInterface {
  save(personVerifications: PersonVerification[]): void;
}
