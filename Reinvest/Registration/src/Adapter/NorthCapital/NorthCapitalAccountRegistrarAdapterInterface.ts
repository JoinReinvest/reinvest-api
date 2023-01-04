import { Result } from "../../Common/Result";
import { AccountId } from "./Model/AccountId";
import { EntityId } from "./Model/EntityId";
import { PartyId } from "./Model/PartyId";

export interface NorthCapitalAccountRegistrarAdapterInterface {
  registerAccountForEntity(mainPartyId: PartyId, entityId: EntityId): AccountId;

  registerAccountForParty(mainPartyId: PartyId): AccountId;

  registerEntityStakeholdersForAccount(entityId: EntityId): Result;
}
