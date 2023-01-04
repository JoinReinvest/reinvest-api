import { MappingQueryInterface } from "../Adapter/Database/MappingQueryInterface";
import { NorthCapitalRegistrarAdapterInterface } from "../Adapter/NorthCapital/NorthCapitalRegistrarAdapterInterface";
import { StakeholderId } from "../Common/Model/Id";
import { Result } from "../Common/Result";
import { Document } from "./Model/Document";

class StakeholderDocumentRegistrar {
  private northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface;
  private mappingQuery: MappingQueryInterface;

  constructor(
    northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface,
    mappingQuery: MappingQueryInterface
  ) {
    this.northCapitalRegistrarAdapter = northCapitalRegistrarAdapter;
    this.mappingQuery = mappingQuery;
  }

  public register(document: Document, stakeholderId: StakeholderId): Result {
    try {
      const partyId = this.mappingQuery.getStakeholderPartyId(stakeholderId);
      this.northCapitalRegistrarAdapter.attachDocumentToParty(
        document.path,
        partyId
      );
    } catch (error: any) {
      return Result.Failed;
    }

    return Result.Success;
  }
}
