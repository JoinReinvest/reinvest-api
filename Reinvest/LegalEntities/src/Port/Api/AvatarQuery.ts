import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { CompanyAccount, CompanyAccountOverview } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { IndividualAccount, IndividualAccountOverview } from 'LegalEntities/Domain/Accounts/IndividualAccount';
import { DraftAccount, DraftAccountType } from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { CompanyName } from 'LegalEntities/Domain/ValueObject/Company';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { PersonalName } from 'LegalEntities/Domain/ValueObject/PersonalName';

export type AvatarOutput = {
  id: string | null;
  initials: string;
  url: string | null;
};

export class AvatarQuery {
  public static getClassName = (): string => 'AvatarQuery';
  private documents: DocumentsService;

  constructor(documents: DocumentsService) {
    this.documents = documents;
  }

  async getAvatarForPerson(avatar: Avatar | null, personName: PersonalName) {
    const initials = personName.getInitials();

    if (avatar === null) {
      return this.getEmptyAvatarOutput(initials);
    }

    return await this.getAvatarUrl(avatar, initials);
  }

  async getAvatarForCompany(avatar: Avatar | null, companyName: CompanyName) {
    const initials = companyName.getInitials();

    if (avatar === null) {
      return this.getEmptyAvatarOutput(initials);
    }

    return await this.getAvatarUrl(avatar, initials);
  }

  async getAvatarForDraft(draft: DraftAccount): Promise<AvatarOutput> {
    const initials = draft.getInitials();
    const avatar = draft.getAvatar();

    if (avatar === null) {
      return this.getEmptyAvatarOutput(initials);
    }

    return await this.getAvatarUrl(avatar, initials);
  }

  private getEmptyAvatarOutput(initials: string): AvatarOutput {
    return {
      id: null,
      url: null,
      initials,
    };
  }

  private async getAvatarUrl(avatar: Avatar, initials: string): Promise<AvatarOutput> {
    const avatarFileLink = (await this.documents.getAvatarFileLink(avatar.toObject())) as FileLink;

    return {
      ...avatarFileLink,
      initials,
    };
  }

  async getAvatarForAccount(account: IndividualAccount | CompanyAccount | IndividualAccountOverview | CompanyAccountOverview): Promise<AvatarOutput> {
    const avatar = account.getAvatar();
    const initials = account.getInitials();

    if (avatar === null) {
      return this.getEmptyAvatarOutput(initials);
    }

    return await this.getAvatarUrl(avatar, initials);
  }
}
