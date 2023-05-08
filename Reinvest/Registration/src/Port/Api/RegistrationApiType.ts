import { ContainerInterface } from 'Container/Container';
import { BankAccountController } from 'Registration/Port/Api/BankAccountController';
import { NorthCapitalDocumentSynchronizationController } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationController';
import { RegistryQuery } from 'Registration/Port/Api/RegistryQuery';
import { SynchronizationController } from 'Registration/Port/Api/SynchronizationController';
import { SynchronizationQuery } from 'Registration/Port/Api/SynchronizationQuery';

import { NorthCapitalDocumentSynchronizationQuery } from './NorthCapitalDocumentSynchronizationQuery';

export type RegistrationApiType = {
  createBankAccount: BankAccountController['createBankAccount'];
  fulfillBankAccount: BankAccountController['fulfillBankAccount'];
  getNorthCapitalAccountStructure: RegistryQuery['getNorthCapitalAccountStructure'];
  listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'];
  listObjectsToSync: SynchronizationQuery['listObjectsToSync'];
  readBankAccount: BankAccountController['readBankAccount'];
  synchronize: SynchronizationController['synchronize'];
  synchronizeDocument: NorthCapitalDocumentSynchronizationController['synchronizeDocument'];
  updateBankAccount: BankAccountController['updateBankAccount'];
};

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
  listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize'),
  synchronizeDocument: container.delegateTo(NorthCapitalDocumentSynchronizationController, 'synchronizeDocument'),
  listObjectsToSync: container.delegateTo(SynchronizationQuery, 'listObjectsToSync'),
  synchronize: container.delegateTo(SynchronizationController, 'synchronize'),
  getNorthCapitalAccountStructure: container.delegateTo(RegistryQuery, 'getNorthCapitalAccountStructure'),
  createBankAccount: container.delegateTo(BankAccountController, 'createBankAccount'),
  fulfillBankAccount: container.delegateTo(BankAccountController, 'fulfillBankAccount'),
  readBankAccount: container.delegateTo(BankAccountController, 'readBankAccount'),
  updateBankAccount: container.delegateTo(BankAccountController, 'updateBankAccount'),
});
