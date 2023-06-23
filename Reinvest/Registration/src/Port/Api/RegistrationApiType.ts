import { ContainerInterface } from 'Container/Container';
import { BankAccountQuery } from 'Registration/IntegrationLogic/UseCase/BankAccount/BankAccountQuery';
import { BankAccountController } from 'Registration/Port/Api/BankAccountController';
import { NorthCapitalDocumentSynchronizationController } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationController';
import { RegistryQuery } from 'Registration/Port/Api/RegistryQuery';
import { SynchronizationController } from 'Registration/Port/Api/SynchronizationController';
import { SynchronizationQuery } from 'Registration/Port/Api/SynchronizationQuery';

import { NorthCapitalDocumentSynchronizationQuery } from './NorthCapitalDocumentSynchronizationQuery';

export type RegistrationApiType = {
  createBankAccount: BankAccountController['createBankAccount'];
  fulfillBankAccount: BankAccountController['fulfillBankAccount'];
  getAccountMapping: RegistryQuery['getAccountMapping'];
  getBankAccount: BankAccountController['getBankAccount'];
  getBankAccountMapping: BankAccountQuery['getBankAccountMapping'];
  getMappingByPartyId: RegistryQuery['getMappingByPartyId'];
  getNorthCapitalAccountStructure: RegistryQuery['getNorthCapitalAccountStructure'];
  immediatelySynchronizeAccount: SynchronizationController['immediatelySynchronizeAccount'];
  immediatelySynchronizeAllAccountStructure: SynchronizationController['immediatelySynchronizeAllAccountStructure'];
  listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'];
  listObjectsToSync: SynchronizationQuery['listObjectsToSync'];
  readBankAccount: BankAccountController['readBankAccount'];
  resynchronizeCompanyAccount: SynchronizationController['resynchronizeCompanyAccount'];
  resynchronizeIndividualAccount: SynchronizationController['resynchronizeIndividualAccount'];
  synchronize: SynchronizationController['synchronize'];
  synchronizeCompany: SynchronizationController['synchronizeCompany'];
  synchronizeDocument: NorthCapitalDocumentSynchronizationController['synchronizeDocument'];
  synchronizeProfile: SynchronizationController['synchronizeProfile'];
  synchronizeStakeholder: SynchronizationController['synchronizeStakeholder'];
  updateBankAccount: BankAccountController['updateBankAccount'];
};

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
  listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize'),
  synchronizeDocument: container.delegateTo(NorthCapitalDocumentSynchronizationController, 'synchronizeDocument'),
  listObjectsToSync: container.delegateTo(SynchronizationQuery, 'listObjectsToSync'),
  synchronize: container.delegateTo(SynchronizationController, 'synchronize'),
  synchronizeProfile: container.delegateTo(SynchronizationController, 'synchronizeProfile'),
  synchronizeCompany: container.delegateTo(SynchronizationController, 'synchronizeCompany'),
  synchronizeStakeholder: container.delegateTo(SynchronizationController, 'synchronizeStakeholder'),
  getNorthCapitalAccountStructure: container.delegateTo(RegistryQuery, 'getNorthCapitalAccountStructure'),
  createBankAccount: container.delegateTo(BankAccountController, 'createBankAccount'),
  fulfillBankAccount: container.delegateTo(BankAccountController, 'fulfillBankAccount'),
  readBankAccount: container.delegateTo(BankAccountController, 'readBankAccount'),
  getBankAccount: container.delegateTo(BankAccountController, 'getBankAccount'),
  updateBankAccount: container.delegateTo(BankAccountController, 'updateBankAccount'),
  getAccountMapping: container.delegateTo(RegistryQuery, 'getAccountMapping'),
  getBankAccountMapping: container.delegateTo(BankAccountQuery, 'getBankAccountMapping'),
  immediatelySynchronizeAllAccountStructure: container.delegateTo(SynchronizationController, 'immediatelySynchronizeAllAccountStructure'),
  immediatelySynchronizeAccount: container.delegateTo(SynchronizationController, 'immediatelySynchronizeAccount'),
  resynchronizeCompanyAccount: container.delegateTo(SynchronizationController, 'resynchronizeCompanyAccount'),
  resynchronizeIndividualAccount: container.delegateTo(SynchronizationController, 'resynchronizeIndividualAccount'),
  getMappingByPartyId: container.delegateTo(RegistryQuery, 'getMappingByPartyId'),
});
