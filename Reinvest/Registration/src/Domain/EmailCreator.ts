import { MappedType } from 'Registration/Common/Model/Mapping/MappedType';

export class EmailCreator {
  static getClassName = (): string => 'EmailCreator';
  private readonly emailDomain: string;

  constructor(emailDomain: string) {
    this.emailDomain = emailDomain;
  }

  create(profileId: string, externalId: string, mappedType: MappedType): string {
    const type = mappedType.toLowerCase();

    return `${type}-${profileId}-${externalId}@${this.emailDomain}`;
  }
}
