import {
  CompanyId,
  InvestingAccountId,
  StakeholderId,
} from "../../Common/Model/Id";
import { Result } from "../../Common/Result";
import { AccountId } from "../NorthCapital/Model/AccountId";
import { EntityId } from "../NorthCapital/Model/EntityId";
import { PartyId } from "../NorthCapital/Model/PartyId";
import { InvestorId } from "../Vertalo/Model/InvestorId";

export interface MappingRepositoryInterface {
  mapCompanyToEntity(companyId: CompanyId, entityId: EntityId): Result;

  mapInvestingAccountToInvestor(
    investingAccountId: InvestingAccountId,
    investorId: InvestorId
  ): Result;

  mapInvestingAccountToNCAccount(
    investingAccountId: InvestingAccountId,
    accountId: AccountId
  ): Result;

  mapStakeholderToParty(stakeholderId: StakeholderId, partyId: PartyId): Result;
}
