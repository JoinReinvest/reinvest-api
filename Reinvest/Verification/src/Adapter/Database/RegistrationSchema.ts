import { JSONObject } from 'HKEKTypes/Generics';
import { Insertable } from 'kysely';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export interface VerifierRecordsTable {
  accountId: string | null;
  createdDate: Date;
  decisionJson: JSONObject;
  eventsJson: JSONObject;
  id: string;
  ncId: string;
  type: VerifierType;
  updatedDate: Date;
}

export type VerifierRecord = Pick<VerifierRecordsTable, 'decisionJson' | 'id' | 'eventsJson' | 'ncId' | 'type' | 'updatedDate' | 'accountId'>;
export type InsertableVerifierRecord = Insertable<VerifierRecordsTable>;
