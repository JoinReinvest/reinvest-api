import {Documents} from "Documents/index";
import {FileInput} from "LegalEntities/Domain/ValueObject/Document";
import {FileLink} from "Documents/Adapter/S3/FileLinkService";

/**
 * Documents Module ACL
 */
export class DocumentsService {
    public static getClassName = () => "DocumentsService";
    private documentsModule: Documents.Main;

    constructor(documentsModule: Documents.Main) {
        this.documentsModule = documentsModule;
    }

    async getAvatarFileLink(fileInput: FileInput | null): Promise<FileLink | {}> {
        if (fileInput === null) {
            return {};
        }
        const {id, path} = fileInput;

        return await this.documentsModule.api().getAvatarLink(id, path)
    }
}