import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import {
  CompanyDraftAccountSchema,
  CorporateDraftAccount,
  DraftAccountState,
  DraftAccountType,
  IndividualDraftAccount,
  IndividualDraftAccountSchema,
  TrustDraftAccount,
} from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { StakeholderInput, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { AvatarOutput, AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';

export type DraftQuery = {
  avatar: AvatarOutput | null;
  details:
    | IndividualDraftAccountSchema
    | (
        | CompanyDraftAccountSchema
        | {
            companyDocuments: { fileName: string; id: string }[];
            ein: string;
            stakeholders: StakeholderInput[];
          }
      );
  id: string;
  isCompleted: boolean;
  state: DraftAccountState;
};

export type DraftsList = {
  id: string;
  type: DraftAccountType;
}[];

export class DraftAccountQuery {
  private draftAccountRepository: DraftAccountRepository;
  private avatarQuery: AvatarQuery;

  constructor(draftAccountRepository: DraftAccountRepository, avatarQuery: AvatarQuery) {
    this.draftAccountRepository = draftAccountRepository;
    this.avatarQuery = avatarQuery;
  }

  public static getClassName = (): string => 'DraftAccountQuery';

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

    const { state, data } = draft.toObject();

    if (data.ein) {
      data.ein = { ein: data.ein.anonymized };
    }

    if (data.companyDocuments) {
      data.companyDocuments = data.companyDocuments.map((document: DocumentSchema) => {
        return {
          id: document.id,
          fileName: document.fileName,
        };
      });
    }

    if (data.stakeholders) {
      data.stakeholders = data.stakeholders.map((stakeholder: StakeholderSchema) => {
        return {
          ...stakeholder,
          ssn: stakeholder.ssn.anonymized,
          domicile: {
            type: stakeholder.domicile?.type,
            birthCountry: stakeholder.domicile?.forGreenCard?.birthCountry ?? stakeholder.domicile?.forVisa?.birthCountry,
            citizenshipCountry: stakeholder.domicile?.forGreenCard?.citizenshipCountry ?? stakeholder.domicile?.forVisa?.citizenshipCountry,
            visaType: stakeholder.domicile?.forVisa?.visaType,
          },
        };
      });
    }

    return {
      id: draftId,
      state: state,
      isCompleted: draft.verifyCompletion(),
      avatar: await this.avatarQuery.getAvatarForDraft(draft),
      details: data,
    };
  }

  async listDrafts(profileId: string): Promise<DraftsList> {
    return this.draftAccountRepository.getAllActiveDraftsIds(profileId);
  }
}
