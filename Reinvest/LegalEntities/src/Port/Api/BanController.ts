import { Pagination } from 'HKEKTypes/Generics';
import { BanRepository } from 'LegalEntities/Adapter/Database/Repository/BanRepository';
import { BannedType } from 'LegalEntities/Domain/BannedEntity';
import { Ban } from 'LegalEntities/UseCases/Ban';
import { Unban } from 'LegalEntities/UseCases/Unban';

export type BannedView = {
  accountId: string | null;
  banId: string;
  banType: 'PROFILE' | 'ACCOUNT';
  bannedObject: BannedType;
  dateCreated: string;
  label: string;
  profileId: string;
  reason: string;
  ssnEin: string;
  status: string;
};

export class BanController {
  static getClassName = () => 'BanController';

  private banUseCase: Ban;
  private banRepository: BanRepository;
  private unbanUseCase: Unban;

  constructor(banRepository: BanRepository, banUseCase: Ban, unbanUseCase: Unban) {
    this.banRepository = banRepository;
    this.banUseCase = banUseCase;
    this.unbanUseCase = unbanUseCase;
  }

  async listBanned(pagination: Pagination): Promise<BannedView[]> {
    return this.banRepository.listBanned(pagination);
  }

  async banUser(profileId: string, reason: string): Promise<boolean> {
    return this.banUseCase.banUser(profileId, reason);
  }

  async banAccount(accountId: string, reason: string): Promise<boolean> {
    return this.banUseCase.banAccount(accountId, reason);
  }

  async unban(banId: string): Promise<boolean> {
    return this.unbanUseCase.unban(banId);
  }
}
