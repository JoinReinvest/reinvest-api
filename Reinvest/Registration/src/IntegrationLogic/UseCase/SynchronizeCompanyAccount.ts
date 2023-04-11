import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";
import {NorthCapitalSynchronizer} from "../../Adapter/NorthCapital/NorthCapitalSynchronizer";
import {VertaloSynchronizer} from "Registration/Adapter/Vertalo/VertaloSynchronizer";
import {CompanyAccountForSynchronization} from "Registration/Domain/Model/Account";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {VertaloMapper} from "Registration/Domain/VendorModel/Vertalo/VertaloMapper";

export class SynchronizeCompanyAccount extends AbstractSynchronize {
    static getClassName = () => 'SynchronizeCompanyAccount';
    private legalEntitiesService: LegalEntitiesService;
    private northCapitalSynchronizer: NorthCapitalSynchronizer;
    private vertaloSynchronizer: VertaloSynchronizer;

    constructor(
        mappingRegistryRepository: MappingRegistryRepository,
        legalEntitiesService: LegalEntitiesService,
        northCapitalSynchronizer: NorthCapitalSynchronizer,
        vertaloSynchronizer: VertaloSynchronizer,
    ) {
        super(mappingRegistryRepository);
        this.legalEntitiesService = legalEntitiesService;
        this.northCapitalSynchronizer = northCapitalSynchronizer;
        this.vertaloSynchronizer = vertaloSynchronizer;
    }

    async execute(record: MappedRecord): Promise<boolean> {
        if (!record.isCompanyAccount() || !await this.lockExecution(record)) {
            return false;
        }
        try {
            console.log(`[START] Company account synchronization, recordId: ${record.getRecordId()}`);
            const companyAccount = await this.legalEntitiesService.getCompanyAccount(record.getProfileId(), record.getExternalId());

            await this.mappingRegistryRepository.addRecord(MappedType.COMPANY, record.getProfileId(), record.getExternalId(), record.getExternalId());
            companyAccount.stakeholders?.map(async (stakeholder: { id: string }) => {
                await this.mappingRegistryRepository.addRecord(MappedType.STAKEHOLDER, record.getProfileId(), record.getExternalId(), stakeholder.id);
            });

            const northCapitalStatus = await this.synchronizeNorthCapital(record, companyAccount);
            const vertaloStatus = await this.synchronizeVertalo(record, companyAccount);

            if (northCapitalStatus && vertaloStatus) {
                await this.setCleanAndUnlockExecution(record);
                console.log(`[SUCCESS] Company account synchronized, recordId: ${record.getRecordId()}`);
                return true;
            } else {
                console.error(`[FAILED] Company account synchronization FAILED, recordId: ${record.getRecordId()}`);
                await this.unlockExecution(record);
            }
        } catch (error: any) {
            console.error(`[FAILED] Company account synchronization FAILED with error, recordId: ${record.getRecordId()}: ${error.message}`);
            await this.unlockExecution(record);
        }

        return false;
    }

    private async synchronizeNorthCapital(record: MappedRecord, companyAccount: CompanyAccountForSynchronization): Promise<boolean> {
        try {
            const northCapitalCompanyAccount = NorthCapitalMapper.mapCompanyAccount(companyAccount);
            await this.northCapitalSynchronizer.synchronizeCompanyAccount(record.getRecordId(), northCapitalCompanyAccount);
            await this.northCapitalSynchronizer.synchronizeLinks(record.getRecordId(), northCapitalCompanyAccount.getLinksConfiguration());

            console.log(`[North Capital SUCCESS] Company account synchronized, recordId: ${record.getRecordId()}`);
            return true;
        } catch (error: any) {
            console.error(`[North Capital FAILED] North Capital Company account synchronization FAILED, recordId: ${record.getRecordId()}: ${error.message}`);
            return false;
        }
    }

    private async synchronizeVertalo(record: MappedRecord, companyAccount: CompanyAccountForSynchronization): Promise<boolean> {
        try {
            const vertaloAccount = VertaloMapper.mapCompanyAccount(companyAccount, record.getEmail());
            await this.vertaloSynchronizer.synchronizeAccount(record.getRecordId(), vertaloAccount)

            console.log(`[Vertalo SUCCESS] Company account synchronized, recordId: ${record.getRecordId()}`);
            return true;
        } catch (error: any) {
            console.error(`[Vertalo FAILED] Company account synchronization FAILED, recordId: ${record.getRecordId()}: ${error.message}`);
            return false;
        }
    }
}