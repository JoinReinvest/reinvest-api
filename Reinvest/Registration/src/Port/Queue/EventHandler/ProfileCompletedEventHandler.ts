import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";
import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {MappedType} from "Registration/Common/MappedType";

export class ProfileCompletedEventHandler implements EventHandler<LegalProfileCompleted> {
    static getClassName = (): string => 'ProfileCompletedEventHandler';
    private mappingRegistryRepository: MappingRegistryRepository;

    constructor(mappingRegistryRepository: MappingRegistryRepository) {
        this.mappingRegistryRepository = mappingRegistryRepository;
    }

    public async handle(event: LegalProfileCompleted): Promise<void> {
        const {profileId} = event.data;
        await this.mappingRegistryRepository.addRecord(profileId, profileId, MappedType.PROFILE);
    }
}