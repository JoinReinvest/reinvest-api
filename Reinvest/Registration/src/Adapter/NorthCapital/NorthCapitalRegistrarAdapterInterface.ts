import {Party} from "./Model/Party";
import {PartyId} from "./Model/PartyId";
import {EntityId} from "./Model/EntityId";
import {Entity} from "./Model/Entity";
import {Path} from "../../Common/Model/TypeValidators";

export interface NorthCapitalRegistrarAdapterInterface {
    createParty(party: Party): PartyId;

    createEntity(entity: Entity): EntityId;

    attachDocumentToParty(path: Path, partyId: PartyId): void;

    attachDocumentToEntity(path: Path, entityId: EntityId): void;

    // it creates a mapping in the REIT db and uses it later to link with NC account
    attachPartyToEntity(partyId: PartyId, entityId: EntityId): void;
}