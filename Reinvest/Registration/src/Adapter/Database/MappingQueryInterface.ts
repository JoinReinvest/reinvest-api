import {
  CompanyId,
  InvestingAccountId,
  StakeholderId,
} from "../../Common/Model/Id";
import { AccountId } from "../NorthCapital/Model/AccountId";
import { EntityId } from "../NorthCapital/Model/EntityId";
import { PartyId } from "../NorthCapital/Model/PartyId";

export interface MappingQueryInterface {
  getCompanyEntityId(companyId: CompanyId): EntityId;

  getNCAccountForInvestingAccount(
    investingAccountId: InvestingAccountId
  ): AccountId;

  getStakeholderPartyId(stakeholderId: StakeholderId): PartyId;
}
