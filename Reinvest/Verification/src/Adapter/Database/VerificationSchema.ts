import { JSONObject, UUID } from 'HKEKTypes/Generics';
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

export interface VerificationFeesTable {
  accountId: UUID;
  amount: number;
  amountAssigned: number;
  dateCreated: Date;
  decisionId: string;
  id: UUID;
  profileId: UUID;
  status: 'ASSIGNED' | 'NOT_ASSIGNED' | 'PARTIALLY_ASSIGNED';
}

export type VerifierRecord = Pick<VerifierRecordsTable, 'decisionJson' | 'id' | 'eventsJson' | 'ncId' | 'type' | 'updatedDate' | 'accountId'>;
export type InsertableVerifierRecord = Insertable<VerifierRecordsTable>;
