import { ContainerInterface } from 'Container/Container';
import { NorthCapitalDocumentSynchronizationController } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationController';
import { SynchronizationController } from 'Registration/Port/Api/SynchronizationController';
import { SynchronizationQuery } from 'Registration/Port/Api/SynchronizationQuery';

import { NorthCapitalDocumentSynchronizationQuery } from './NorthCapitalDocumentSynchronizationQuery';

export type RegistrationApiType = {
  listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'];
  listObjectsToSync: SynchronizationQuery['listObjectsToSync'];
  synchronize: SynchronizationController['synchronize'];
  synchronizeDocument: NorthCapitalDocumentSynchronizationController['synchronizeDocument'];
};

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
  listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize'),
  synchronizeDocument: container.delegateTo(NorthCapitalDocumentSynchronizationController, 'synchronizeDocument'),
  listObjectsToSync: container.delegateTo(SynchronizationQuery, 'listObjectsToSync'),
  synchronize: container.delegateTo(SynchronizationController, 'synchronize'),
});
