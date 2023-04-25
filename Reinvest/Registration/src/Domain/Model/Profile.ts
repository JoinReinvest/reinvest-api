import { Address, DocumentSchema, DomicileType } from 'Registration/Domain/Model/ReinvestTypes';

export type ProfileForSynchronization = {
  address: Address;
  dateOfBirth: string;
  domicile: DomicileType;
  experience: string;
  firstName: string;
  idScan: DocumentSchema[];
  lastName: string;
  ssn: string | null;
  middleName?: string;
};
