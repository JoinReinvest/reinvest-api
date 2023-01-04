import { Party } from "../../Adapter/NorthCapital/Model/Party";
import { Stakeholder } from "../Model/Stakeholder";

export class StakeholderToPartyMapper {
  static map(stakeholder: Stakeholder): Party {
    return new Party();
  }
}
