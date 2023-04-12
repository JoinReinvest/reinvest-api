import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";

import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {DomainEvent} from "SimpleAggregator/Types";

export class ProfileCompletedEventHandler implements EventHandler<DomainEvent> {
    static getClassName = (): string => 'ProfileCompletedEventHandler';
    private mappingRegistryRepository: MappingRegistryRepository;
    private synchronizeProfileUseCase: SynchronizeProfile;

    constructor(mappingRegistryRepository: MappingRegistryRepository, synchronizeProfileUseCase: SynchronizeProfile) {
        this.mappingRegistryRepository = mappingRegistryRepository;
        this.synchronizeProfileUseCase = synchronizeProfileUseCase;
    }

    public async handle(event: DomainEvent): Promise<void> {
        const {id: profileId} = event;
        const record = await this.mappingRegistryRepository.addRecord(MappedType.PROFILE, profileId);

        await this.synchronizeProfileUseCase.execute(record);
    }
}