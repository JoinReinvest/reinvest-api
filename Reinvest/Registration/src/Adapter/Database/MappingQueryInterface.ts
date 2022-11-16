import {PartyId} from "../NorthCapital/Model/PartyId";
import {EntityId} from "../NorthCapital/Model/EntityId";
import {CompanyId, InvestingAccountId, StakeholderId} from "../../Common/Model/Id";
import {AccountId} from "../NorthCapital/Model/AccountId";

export interface MappingQueryInterface {

    getStakeholderPartyId(stakeholderId: StakeholderId): PartyId;

    getCompanyEntityId(companyId: CompanyId): EntityId;

    getNCAccountForInvestingAccount(investingAccountId: InvestingAccountId): AccountId;
}