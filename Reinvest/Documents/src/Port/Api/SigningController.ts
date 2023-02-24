import {IdGenerator} from "IdGenerator/IdGenerator";

export type SignatureId = {
    signatureId: string
};

export class SigningController {
    public static getClassName = (): string => "SigningController";

    public async signDocumentFromTemplate(
        templateId: string,
        fields: any,
        ip: string,
        timestamp: number,
        signature: string,
        profileId: string
    ): Promise<SignatureId> {
        console.log({signatureArguments: arguments});

        return <SignatureId>{signatureId: (new IdGenerator()).createUuid()};
    }
}