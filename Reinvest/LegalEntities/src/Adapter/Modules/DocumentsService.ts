import {Documents} from "Documents/index";
import {FileInput} from "LegalEntities/Domain/ValueObject/Document";
import {FileLink} from "Documents/Adapter/S3/FileLinkService";

export class DocumentsService {
    public static getClassName = () => "DocumentsService";
    private documentsModule: Documents.Main;

    constructor(documentsModule: Documents.Main) {
        this.documentsModule = documentsModule;
    }

    async getLink(fileInput: FileInput | null): Promise<FileLink | null> {
        if (fileInput === null) {
            return null;
        }
        // this.documentsModule.api()
        return {
            id: fileInput.id,
            url: "test"
        }
    }
}