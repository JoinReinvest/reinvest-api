import {Documents} from "Documents/index";

export type FileLink = {
    url: string,
    id: string,
}

/**
 * Documents Module ACL
 */
export class RegistrationDocumentsService {
    public static getClassName = () => "RegistrationDocumentsService";
    private documentsModule: Documents.Main;

    constructor(documentsModule: Documents.Main) {
        this.documentsModule = documentsModule;
    }

    async getDocumentFileLink(id: string, path: string): Promise<FileLink> {
        return await this.documentsModule.api().getDocumentLink(id, path)
    }
}