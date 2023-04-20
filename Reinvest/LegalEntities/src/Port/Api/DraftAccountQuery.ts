import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import {
  CompanyDraftAccountDefaultSchema,
  CompanyDraftAccountSchema,
  CorporateDraftAccount,
  DraftAccountState,
  DraftAccountType,
  IndividualDraftAccount,
  IndividualDraftAccountSchema,
  TrustDraftAccount,
} from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { StakeholderOutput, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { AvatarOutput, AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';
import { SensitiveNumberSchema } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';

export type CompanyDraftAccountOutput = CompanyDraftAccountDefaultSchema & {
  companyDocuments: { fileName: string; id: string }[];
  ein: { ein: string };
  stakeholders: StakeholderOutput[];
};

export type DraftQuery = {
  avatar: AvatarOutput | null;
  details: IndividualDraftAccountSchema | CompanyDraftAccountOutput;
  id: string;
  isCompleted: boolean;
  state: DraftAccountState;
};

export type DraftsList = {
  id: string;
  type: DraftAccountType;
}[];

export class DraftAccountQuery {
  public static getClassName = (): string => 'DraftAccountQuery';
  private draftAccountRepository: DraftAccountRepository;
  private avatarQuery: AvatarQuery;

  constructor(draftAccountRepository: DraftAccountRepository, avatarQuery: AvatarQuery) {
    this.draftAccountRepository = draftAccountRepository;
    this.avatarQuery = avatarQuery;
  }

  async getDraftDetails(profileId: string, draftId: string, accountType: DraftAccountType): Promise<DraftQuery | null> {
    let draft = null;
    switch (accountType) {
      case DraftAccountType.INDIVIDUAL:
        draft = (await this.draftAccountRepository.getIndividualDraftForProfile(profileId, draftId)) as IndividualDraftAccount;
        break;
      case DraftAccountType.CORPORATE:
        draft = (await this.draftAccountRepository.getCorporateDraftForProfile(profileId, draftId)) as CorporateDraftAccount;
        break;
      case DraftAccountType.TRUST:
        draft = (await this.draftAccountRepository.getTrustDraftForProfile(profileId, draftId)) as TrustDraftAccount;
        break;
      default:
        throw new Error('Unknown account type');
    }

    if (!draft.isType(accountType)) {
      return null;
    }

    const { state, data: draftData } = draft.toObject();
    const data = draft.isIndividual() ? <IndividualDraftAccountSchema>draftData : this.transformDraftDataForCompany(<CompanyDraftAccountSchema>draftData);

    return {
      id: draftId,
      state: state,
      isCompleted: draft.verifyCompletion(),
      avatar: await this.avatarQuery.getAvatarForDraft(draft),
      details: data,
    };
  }

  private transformDraftDataForCompany(companySchemaData: CompanyDraftAccountSchema): CompanyDraftAccountOutput {
    const data = { ...companySchemaData } as unknown as CompanyDraftAccountOutput; // mapping one type to another

    if (companySchemaData.ein) {
      data.ein = { ein: companySchemaData.ein.anonymized };
    }

    if (companySchemaData.companyDocuments) {
      data.companyDocuments = companySchemaData.companyDocuments.map((document: DocumentSchema) => {
        return {
          id: document.id,
          fileName: document.fileName,
        };
      });
    }

    if (companySchemaData.stakeholders) {
      data.stakeholders = companySchemaData.stakeholders.map((stakeholder: StakeholderSchema): StakeholderOutput => {
        return {
          ...stakeholder,
          ssn: (<SensitiveNumberSchema>stakeholder.ssn).anonymized,
        };
      });
    }

    return data;
  }

  async listDrafts(profileId: string): Promise<DraftsList> {
    return this.draftAccountRepository.getAllActiveDraftsIds(profileId);
  }
}
