import { LegalEntities } from 'LegalEntities/index';

export class LegalEntitiesService {
  private legalEntitiesModule: LegalEntities.Main;
  static getClassName = (): string => 'LegalEntitiesService';

  constructor(legalEntitiesModule: LegalEntities.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
  }
}
