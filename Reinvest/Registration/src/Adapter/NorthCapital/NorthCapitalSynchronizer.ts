import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";
import {NorthCapitalAdapter} from "Registration/Adapter/NorthCapital/NorthCapitalAdapter";
import {
    NorthCapitalSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalSynchronizationRepository";
import {
    NorthCapitalEntityType,
    NorthCapitalLinkMapping
} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";
import {
    NorthCapitalIndividualAccount
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalIndividualAccount";
import {
    NorthCapitalLink,
    NorthCapitalObjectType,
    NorthCapitalSynchronizationMapping
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import {
    NorthCapitalDocumentsSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository";
import {DocumentSchema} from "Registration/Domain/Model/ReinvestTypes";

export class NorthCapitalSynchronizer {
    static getClassName = () => 'NorthCapitalSynchronizer';
    private northCapitalAdapter: NorthCapitalAdapter;
    private northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository;
    private northCapitalDocumentSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository;

    constructor(
        northCapitalAdapter: NorthCapitalAdapter,
        northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository,
        northCapitalDocumentSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository,
    ) {
        this.northCapitalAdapter = northCapitalAdapter;
        this.northCapitalSynchronizationRepository = northCapitalSynchronizationRepository;
        this.northCapitalDocumentSynchronizationRepository = northCapitalDocumentSynchronizationRepository;
    }

    async synchronizeMainParty(recordId: string, mainParty: MainParty): Promise<void> {
        const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);
        const documents = mainParty.getDocuments();

        if (synchronizationRecord === null) {
            const partyId = await this.northCapitalAdapter.createParty(mainParty.getPartyData());
            await this.northCapitalSynchronizationRepository.createSynchronizationRecord(recordId, partyId, mainParty.getCrc(), NorthCapitalEntityType.PARTY);
            await this.addDocuments(recordId, partyId, NorthCapitalObjectType.PARTY, documents);
        } else if (synchronizationRecord.isOutdated(mainParty.getCrc())) {
            await this.northCapitalAdapter.updateParty(synchronizationRecord.getNorthCapitalId(), mainParty.getPartyData());
            synchronizationRecord.setCrc(mainParty.getCrc());
            await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
            await this.addDocuments(recordId, synchronizationRecord.getNorthCapitalId(), NorthCapitalObjectType.PARTY, documents);
        }
    }

    private async addDocuments(recordId: string, partyId: string, northCapitalObjectType: NorthCapitalObjectType, documents: DocumentSchema[]) {
        if (documents.length === 0) {
            return;
        }

        await this.northCapitalDocumentSynchronizationRepository.addDocuments(recordId, partyId, northCapitalObjectType, documents)
    }

    async synchronizeIndividualAccount(recordId: string, northCapitalIndividualAccount: NorthCapitalIndividualAccount) {
        try {
            const mainPartyId = await this.northCapitalSynchronizationRepository.getMainPartyIdByProfile(northCapitalIndividualAccount.getProfileId());
            let synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

            if (synchronizationRecord === null) {
                const individualAccountId = await this.northCapitalAdapter.createAccount(northCapitalIndividualAccount.getAccountData());
                await this.northCapitalAdapter.updateParty(mainPartyId, northCapitalIndividualAccount.getPartyData());
                await this.northCapitalSynchronizationRepository.createSynchronizationRecord(recordId, individualAccountId, northCapitalIndividualAccount.getCrc(), NorthCapitalEntityType.ACCOUNT);
            } else if (synchronizationRecord.isOutdated(northCapitalIndividualAccount.getCrc())) {

                if (northCapitalIndividualAccount.isOutdatedAccount(synchronizationRecord.getCrc())) {
                    await this.northCapitalAdapter.updateAccount(synchronizationRecord.getNorthCapitalId(), northCapitalIndividualAccount.getAccountData());
                }

                if (northCapitalIndividualAccount.isOutdatedParty(synchronizationRecord.getCrc())) {
                    await this.northCapitalAdapter.updateParty(mainPartyId, northCapitalIndividualAccount.getPartyData());
                }

                synchronizationRecord.setCrc(northCapitalIndividualAccount.getCrc());
                await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
            }
        } catch (error: any) {
            throw new Error(error.message === 'MAIN_PARTY_NOT_FOUND'
                ? 'Main party is not synchronized'
                : error.message);
        }
    }

    public async synchronizeLinks(recordId: string, linksConfiguration: NorthCapitalLink[]) {
        let synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);
        if (synchronizationRecord === null) {
            throw new Error('Synchronization record is not found');
        }

        const profileEntities = await this.northCapitalSynchronizationRepository.getAllProfileSynchronizationMapping(synchronizationRecord.getRecordId());
        const synchronizedLinks = synchronizationRecord.getLinks();

        for (const link of linksConfiguration) {
            const {mappingConfiguration, linkConfiguration} = link;
            const existingSynchronizedLink = synchronizedLinks.find((synchronizedLink: NorthCapitalLinkMapping) => {
                return synchronizedLink.mapping.type === mappingConfiguration.type
                    && synchronizedLink.mapping.profileId === mappingConfiguration.profileId
                    && synchronizedLink.mapping.externalId === mappingConfiguration.externalId;
            });

            if (existingSynchronizedLink) {
                continue;
            }

            const existingSynchronizedEntity = profileEntities.find((entity: NorthCapitalSynchronizationMapping) => {
                return entity.mapping.type === mappingConfiguration.type
                    && entity.mapping.profileId === mappingConfiguration.profileId
                    && entity.mapping.externalId === mappingConfiguration.externalId;
            });

            if (!existingSynchronizedEntity) {
                throw new Error('Entity is not synchronized');
            }

            const linkId = await this.northCapitalAdapter.linkEntityToAccount(
                existingSynchronizedEntity.northCapitalId,
                synchronizationRecord.getNorthCapitalId(),
                linkConfiguration
            );

            synchronizationRecord.addLink(linkId, existingSynchronizedEntity.northCapitalId, mappingConfiguration);
        }

        await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
    }
}
