import { Insertable } from 'kysely';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export interface VerifierRecordsTable {
  aml: object | string;
  createdDate: Date;
  decisions: object | string;
  id: string;
  kyc: object | string;
  ncId: string;
  type: VerifierType;
  updatedDate: Date;
}

export type VerifierRecord = Pick<VerifierRecordsTable, 'aml' | 'decisions' | 'id' | 'kyc' | 'ncId' | 'type' | 'updatedDate'>;
export type InsertableVerifierRecord = Insertable<VerifierRecordsTable>;
