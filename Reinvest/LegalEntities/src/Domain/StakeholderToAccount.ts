import { Stakeholder, StakeholderInput, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { v4 as uuidv4 } from 'uuid';

export class StakeholderToAccount {
  static getStakeholderDataToAddToAccount(
    account: {
      getStakeholderById: (id: string) => Stakeholder | null;
    },
    data: StakeholderInput[],
    profileId: string,
  ): {
    isNewStakeholder: boolean;
    stakeholderSchema: StakeholderSchema;
  }[] {
    return data.map((stakeholder: StakeholderInput) => {
      const stakeholderSchema = { ...stakeholder } as unknown as StakeholderSchema; // mapping stakeholder input to stakeholder schema
      const { id, idScan } = stakeholder;
      const isNewStakeholder = !id; // if id is not null, then it is an existing stakeholder
      const existingStakeholder = !isNewStakeholder ? account.getStakeholderById(id) : null;

      if (!isNewStakeholder && existingStakeholder === null) {
        throw new ValidationError(ValidationErrorEnum.NOT_FOUND, 'stakeholder', id);
      }

      const ssn = stakeholder?.ssn?.ssn ?? null;

      if (ssn === null) {
        if (isNewStakeholder) {
          throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'ssn');
        } else {
          // rewrite previous ssn
          stakeholderSchema.ssn = (<Stakeholder>existingStakeholder).getRawSSN();
        }
      } else {
        // update ssn
        stakeholderSchema.ssn = ssn;
      }

      stakeholderSchema.id = isNewStakeholder ? uuidv4() : id;

      stakeholderSchema.idScan = idScan.map((document: { fileName: string; id: string }) => ({
        id: document.id,
        fileName: document.fileName,
        path: profileId,
      }));

      return {
        isNewStakeholder,
        stakeholderSchema,
      };
    });
  }
}
