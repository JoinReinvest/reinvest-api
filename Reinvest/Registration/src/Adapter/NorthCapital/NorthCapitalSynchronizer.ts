import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';
import { NorthCapitalSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalSynchronizationRepository';
import { RegistrationDocumentsService } from 'Registration/Adapter/Modules/RegistrationDocumentsService';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { NorthCapitalEntityType, NorthCapitalLinkMapping } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord';
import { DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';
import { MainParty } from 'Registration/Domain/VendorModel/NorthCapital/MainParty';
import { NorthCapitalCompanyAccount } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalCompanyAccount';
import { NorthCapitalCompanyEntity } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalCompanyEntity';
import { NorthCapitalIndividualAccount } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalIndividualAccount';
import { NorthCapitalStakeholderParty } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalStakeholderParty';
import { NorthCapitalLink, NorthCapitalObjectType, NorthCapitalSynchronizationMapping } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class NorthCapitalSynchronizer {
  static getClassName = () => 'NorthCapitalSynchronizer';
  private northCapitalAdapter: NorthCapitalAdapter;
  private northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository;
  private northCapitalDocumentSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository;
  private documentService: RegistrationDocumentsService;

  constructor(
    northCapitalAdapter: NorthCapitalAdapter,
    northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository,
    northCapitalDocumentSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository,
    documentService: RegistrationDocumentsService,
  ) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.northCapitalSynchronizationRepository = northCapitalSynchronizationRepository;
    this.northCapitalDocumentSynchronizationRepository = northCapitalDocumentSynchronizationRepository;
    this.documentService = documentService;
  }

  async synchronizeMainParty(recordId: string, mainParty: MainParty): Promise<void> {
    const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

    if (synchronizationRecord === null) {
      const partyId = await this.northCapitalAdapter.createParty(mainParty.getPartyData());
      await this.northCapitalSynchronizationRepository.createSynchronizationRecord(recordId, partyId, mainParty.getCrc(), NorthCapitalEntityType.PARTY);
      await this.addDocuments(recordId, partyId, NorthCapitalObjectType.PARTY, mainParty.getDocuments());
    } else if (synchronizationRecord.isOutdated(mainParty.getCrc())) {
      if (mainParty.isPartyOutdated(synchronizationRecord.getCrc())) {
        await this.northCapitalAdapter.updateParty(synchronizationRecord.getNorthCapitalId(), mainParty.getPartyData());
      }

      if (mainParty.isDocumentsOutdated(synchronizationRecord.getCrc())) {
        await this.addDocuments(recordId, synchronizationRecord.getNorthCapitalId(), NorthCapitalObjectType.PARTY, mainParty.getDocuments());
      }

      synchronizationRecord.setCrc(mainParty.getCrc());
      await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
    }
  }

  private async addDocuments(recordId: string, partyId: string, northCapitalObjectType: NorthCapitalObjectType, documents: DocumentSchema[]) {
    if (documents.length === 0) {
      return;
    }

    await this.northCapitalDocumentSynchronizationRepository.addDocuments(recordId, partyId, northCapitalObjectType, documents);
  }

  async synchronizeIndividualAccount(recordId: string, northCapitalIndividualAccount: NorthCapitalIndividualAccount) {
    try {
      const mainPartyId = await this.northCapitalSynchronizationRepository.getMainPartyIdByProfile(northCapitalIndividualAccount.getProfileId());
      const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

      if (synchronizationRecord === null) {
        const individualAccountId = await this.northCapitalAdapter.createAccount(northCapitalIndividualAccount.getAccountData());
        await this.northCapitalAdapter.updateParty(mainPartyId, northCapitalIndividualAccount.getPartyData());
        await this.northCapitalSynchronizationRepository.createSynchronizationRecord(
          recordId,
          individualAccountId,
          northCapitalIndividualAccount.getCrc(),
          NorthCapitalEntityType.ACCOUNT,
        );
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
      throw new Error(error.message === 'MAIN_PARTY_NOT_FOUND' ? 'Main party is not synchronized' : error.message);
    }
  }

  public async synchronizeLinks(recordId: string, linksConfiguration: NorthCapitalLink[]) {
    const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

    if (synchronizationRecord === null) {
      throw new Error('Synchronization record is not found');
    }

    const profileEntities = await this.northCapitalSynchronizationRepository.getAllProfileSynchronizationMapping(synchronizationRecord.getRecordId()); // all synced objects with North Capital
    const synchronizedLinks = synchronizationRecord.getLinks(); // existing links

    for (const link of linksConfiguration) {
      // definition of what parties should be linked to the account
      const { mappingConfiguration, linkConfiguration } = link;
      const existingSynchronizedLink = synchronizedLinks.find((synchronizedLink: NorthCapitalLinkMapping) => {
        // check if link already exists
        return (
          synchronizedLink.mapping.type === mappingConfiguration.type &&
          synchronizedLink.mapping.profileId === mappingConfiguration.profileId &&
          synchronizedLink.mapping.externalId === mappingConfiguration.externalId
        );
      });

      if (existingSynchronizedLink) {
        continue;
      }

      const existingSynchronizedEntity = profileEntities.find((entity: NorthCapitalSynchronizationMapping) => {
        // check if entity is already synced, so exists in North Capital
        return (
          entity.mapping.type === mappingConfiguration.type &&
          entity.mapping.profileId === mappingConfiguration.profileId &&
          entity.mapping.externalId === mappingConfiguration.externalId
        );
      });

      if (!existingSynchronizedEntity) {
        // entity not exists in North Capital
        throw new Error('Entity is not synchronized');
      }

      const linkedRecordIsAccount = mappingConfiguration?.thisIsAccountEntry; // check if entity is account or party, because account should always be a first entry in link
      const accountId = linkedRecordIsAccount ? existingSynchronizedEntity.northCapitalId : synchronizationRecord.getNorthCapitalId();
      const entityId = linkedRecordIsAccount ? synchronizationRecord.getNorthCapitalId() : existingSynchronizedEntity.northCapitalId;

      const linkId = await this.northCapitalAdapter.linkEntityToAccount(entityId, accountId, linkConfiguration);

      synchronizationRecord.addLink(linkId, existingSynchronizedEntity.northCapitalId, mappingConfiguration);
    }

    await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
  }

  async synchronizeDocument(documentId: string): Promise<boolean> {
    const document = await this.northCapitalDocumentSynchronizationRepository.getDocumentToSync(documentId);

    if (document === null) {
      return false;
    }

    try {
      const { documentPath, northCapitalType, northCapitalId, documentFilename } = document;

      if (await this.checkIfFileExistsInNorthCapital(northCapitalId, documentId)) {
        console.log(`Document ${documentId} already exists in North Capital for ${northCapitalType} ${northCapitalId}`);
      } else if (northCapitalType === NorthCapitalObjectType.PARTY || northCapitalType === NorthCapitalObjectType.ENTITY) {
        const { url } = await this.documentService.getDocumentFileLink(documentId, documentPath);
        await this.northCapitalAdapter.uploadPartyDocument(northCapitalId, url, documentFilename, documentId, northCapitalType);
      }

      return await this.northCapitalDocumentSynchronizationRepository.setClean(document);
    } catch (error: any) {
      const { reason } = error;

      if (document && reason === 'FILE_NOT_FOUND') {
        console.error(`Document ${documentId} not found in document service`, error);
        await this.northCapitalDocumentSynchronizationRepository.setFailed(document);
      } else {
        console.error(`Document ${documentId} synchronization failed`, error);

        if (document) {
          await this.northCapitalDocumentSynchronizationRepository.moveToTheEndOfQueue(document);
        }
      }

      return false;
    }
  }

  private async checkIfFileExistsInNorthCapital(northCapitalId: string, documentId: string): Promise<boolean> {
    const uploadedDocuments = await this.northCapitalAdapter.getUploadedPartyDocuments(northCapitalId);
    const documentIdRegex = new RegExp(`.*(${documentId}).*`);

    for (const document of uploadedDocuments) {
      const { documentTitle } = document;

      if (documentIdRegex.test(documentTitle)) {
        return true;
      }
    }

    return false;
  }

  async synchronizeCompanyAccount(recordId: string, northCapitalCompanyAccount: NorthCapitalCompanyAccount) {
    try {
      const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

      if (synchronizationRecord === null) {
        const companyAccountId = await this.northCapitalAdapter.createAccount(northCapitalCompanyAccount.getAccountData());
        await this.northCapitalSynchronizationRepository.createSynchronizationRecord(
          recordId,
          companyAccountId,
          northCapitalCompanyAccount.getCrc(),
          NorthCapitalEntityType.ACCOUNT,
        );
      } else if (synchronizationRecord.isOutdated(northCapitalCompanyAccount.getCrc())) {
        if (northCapitalCompanyAccount.isOutdatedAccount(synchronizationRecord.getCrc())) {
          await this.northCapitalAdapter.updateAccount(synchronizationRecord.getNorthCapitalId(), northCapitalCompanyAccount.getAccountData());
        }

        synchronizationRecord.setCrc(northCapitalCompanyAccount.getCrc());
        await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async synchronizeCompanyEntity(recordId: string, northCapitalCompanyEntity: NorthCapitalCompanyEntity) {
    try {
      const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

      if (synchronizationRecord === null) {
        const companyEntityId = await this.northCapitalAdapter.createEntity(northCapitalCompanyEntity.getEntityData());
        await this.northCapitalSynchronizationRepository.createSynchronizationRecord(
          recordId,
          companyEntityId,
          northCapitalCompanyEntity.getCrc(),
          NorthCapitalEntityType.ENTITY,
        );
        await this.addDocuments(recordId, companyEntityId, NorthCapitalObjectType.ENTITY, northCapitalCompanyEntity.getDocuments());
      } else if (synchronizationRecord.isOutdated(northCapitalCompanyEntity.getCrc())) {
        if (northCapitalCompanyEntity.isOutdatedEntity(synchronizationRecord.getCrc())) {
          await this.northCapitalAdapter.updateEntity(synchronizationRecord.getNorthCapitalId(), northCapitalCompanyEntity.getEntityData());
        }

        if (northCapitalCompanyEntity.isOutdatedDocuments(synchronizationRecord.getCrc())) {
          await this.addDocuments(recordId, synchronizationRecord.getNorthCapitalId(), NorthCapitalObjectType.ENTITY, northCapitalCompanyEntity.getDocuments());
        }

        synchronizationRecord.setCrc(northCapitalCompanyEntity.getCrc());
        await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async synchronizeStakeholderParty(recordId: string, stakeholder: NorthCapitalStakeholderParty): Promise<void> {
    const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

    if (synchronizationRecord === null) {
      const partyId = await this.northCapitalAdapter.createParty(stakeholder.getPartyData());
      await this.northCapitalSynchronizationRepository.createSynchronizationRecord(recordId, partyId, stakeholder.getCrc(), NorthCapitalEntityType.PARTY);
      await this.addDocuments(recordId, partyId, NorthCapitalObjectType.PARTY, stakeholder.getDocuments());
    } else if (synchronizationRecord.isOutdated(stakeholder.getCrc())) {
      if (stakeholder.isPartyOutdated(synchronizationRecord.getCrc())) {
        await this.northCapitalAdapter.updateParty(synchronizationRecord.getNorthCapitalId(), stakeholder.getPartyData());
      }

      if (stakeholder.isDocumentsOutdated(synchronizationRecord.getCrc())) {
        await this.addDocuments(recordId, synchronizationRecord.getNorthCapitalId(), NorthCapitalObjectType.PARTY, stakeholder.getDocuments());
      }

      synchronizationRecord.setCrc(stakeholder.getCrc());
      await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord);
    }
  }
}
