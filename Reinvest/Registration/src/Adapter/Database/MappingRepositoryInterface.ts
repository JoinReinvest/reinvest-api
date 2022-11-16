import {PartyId} from "../NorthCapital/Model/PartyId";
import {Result} from "../../Common/Result";
import {EntityId} from "../NorthCapital/Model/EntityId";
import {CompanyId, InvestingAccountId, StakeholderId} from "../../Common/Model/Id";
import {AccountId} from "../NorthCapital/Model/AccountId";
import {InvestorId} from "../Vertalo/Model/InvestorId";

export interface MappingRepositoryInterface {

    mapStakeholderToParty(stakeholderId: StakeholderId, partyId: PartyId): Result;

    mapCompanyToEntity(companyId: CompanyId, entityId: EntityId): Result;

    mapInvestingAccountToNCAccount(investingAccountId: InvestingAccountId, accountId: AccountId): Result;

    mapInvestingAccountToInvestor(investingAccountId: InvestingAccountId, investorId: InvestorId): Result;
}