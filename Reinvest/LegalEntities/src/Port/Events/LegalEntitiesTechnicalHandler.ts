import { ContainerInterface } from 'Container/Container';
import { BanEventHandler } from 'LegalEntities/Port/Events/BanEventHandler';

export type LegalEntitiesTechnicalHandlerType = {
  AccountBanned: BanEventHandler['handle'];
  ProfileBanned: BanEventHandler['handle'];
};

export const LegalEntitiesTechnicalHandler = (container: ContainerInterface): LegalEntitiesTechnicalHandlerType => ({
  AccountBanned: container.delegateTo(BanEventHandler, 'handle'),
  ProfileBanned: container.delegateTo(BanEventHandler, 'handle'),
});
