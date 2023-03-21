import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";
import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";

import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";

export class ProfileCompletedEventHandler implements EventHandler<LegalProfileCompleted> {
    static getClassName = (): string => 'ProfileCompletedEventHandler';
    private mappingRegistryRepository: MappingRegistryRepository;
    private synchronizeProfileUseCase: SynchronizeProfile;

    constructor(mappingRegistryRepository: MappingRegistryRepository, synchronizeProfileUseCase: SynchronizeProfile) {
        this.mappingRegistryRepository = mappingRegistryRepository;
        this.synchronizeProfileUseCase = synchronizeProfileUseCase;
    }

    public async handle(event: LegalProfileCompleted): Promise<void> {
        const {profileId} = event.data;
        const record = await this.mappingRegistryRepository.addRecord(profileId, profileId, MappedType.PROFILE);

        await this.synchronizeProfileUseCase.execute(record);
    }
}