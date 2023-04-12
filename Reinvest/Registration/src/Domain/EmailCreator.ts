import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";

export class EmailCreator {
    static getClassName = (): string => "EmailCreator";
    private readonly emailDomain: string;

    constructor(emailDomain: string) {
        this.emailDomain = emailDomain;
    }

    create(profileId: string, externalId: string, dependentId: string, mappedType: MappedType): string {
        const type = mappedType.toLowerCase();

        switch (mappedType) {
            case MappedType.PROFILE:
                return `${type}-${profileId}@${this.emailDomain}`;
            case MappedType.STAKEHOLDER:
                return `${type}-${profileId}-${externalId}-${dependentId}@${this.emailDomain}`;
            default:
                return `${type}-${profileId}-${externalId}@${this.emailDomain}`;
        }
    }
}