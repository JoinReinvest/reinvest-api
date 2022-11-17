import {StakeholderToPartyMapper} from "./Mapper/StakeholderToPartyMapper";
import {NorthCapitalRegistrarAdapterInterface} from "../Adapter/NorthCapital/NorthCapitalRegistrarAdapterInterface";
import {MappingRepositoryInterface} from "../Adapter/Database/MappingRepositoryInterface";
import {Result} from "../Common/Result";
import {Stakeholder} from "./Model/Stakeholder";

class StakeholderRegistrar {
    private northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface;
    private mappingRepository: MappingRepositoryInterface;

    constructor(
        northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface,
        mappingRepository: MappingRepositoryInterface
    ) {
        this.northCapitalRegistrarAdapter = northCapitalRegistrarAdapter;
        this.mappingRepository = mappingRepository;
    }

    public register(stakeholder: Stakeholder): Result {
        try {
            const party = StakeholderToPartyMapper.map(stakeholder);
            const partyId = this.northCapitalRegistrarAdapter.createParty(party);
            this.mappingRepository.mapStakeholderToParty(stakeholder.getId(), partyId);
        } catch (error: any) {
            return Result.Failed;
        }

        return Result.Success;
    }
}