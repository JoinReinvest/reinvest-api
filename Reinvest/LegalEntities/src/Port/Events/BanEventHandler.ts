import { Ban } from 'LegalEntities/UseCases/Ban';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class BanEventHandler implements EventHandler<DomainEvent> {
  private banUseCase: Ban;

  constructor(banUseCase: Ban) {
    this.banUseCase = banUseCase;
  }

  static getClassName = (): string => 'BanEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (!['AccountBanned', 'ProfileBanned'].includes(event.kind)) {
      return;
    }

    const { profileId, accountId, stakeholderId, type, reasons } = event.data;

    switch (type) {
      case 'COMPANY':
        await this.banUseCase.banAccountByCompany(accountId, reasons);
        break;
      case 'STAKEHOLDER':
        await this.banUseCase.banAccountByStakeholder(accountId, stakeholderId, reasons);
        break;
      case 'PROFILE':
        await this.banUseCase.banProfile(profileId, reasons);
    }
  }
}
