import {InvestingAccountId, ProfileId} from "../../Common/Model/Id";
import {InvestorId} from "./Model/InvestorId";

export interface VertaloInvestorRegistrarAdapterInterface {

    registerInvestorAccount(profileId: ProfileId, investingAccountId: InvestingAccountId): InvestorId;
}