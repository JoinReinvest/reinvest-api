import {AccountId} from "./Model/AccountId";
import {EntityId} from "./Model/EntityId";
import {PartyId} from "./Model/PartyId";
import {Result} from "../../Common/Result";

export interface NorthCapitalAccountRegistrarAdapterInterface {

    registerAccountForEntity(mainPartyId: PartyId, entityId: EntityId): AccountId;

    registerAccountForParty(mainPartyId: PartyId): AccountId;

    registerEntityStakeholdersForAccount(entityId: EntityId): Result;
}