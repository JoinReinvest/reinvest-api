import { Path } from "../../Common/Model/TypeValidators";
import { Entity } from "./Model/Entity";
import { EntityId } from "./Model/EntityId";
import { Party } from "./Model/Party";
import { PartyId } from "./Model/PartyId";

export interface NorthCapitalRegistrarAdapterInterface {
  attachDocumentToEntity(path: Path, entityId: EntityId): void;

  attachDocumentToParty(path: Path, partyId: PartyId): void;

  // it creates a mapping in the REIT db and uses it later to link with NC account
  attachPartyToEntity(partyId: PartyId, entityId: EntityId): void;

  createEntity(entity: Entity): EntityId;

  createParty(party: Party): PartyId;
}
