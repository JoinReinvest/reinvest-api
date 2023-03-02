import {FileLink, FileLinkService, FileType} from "../../Adapter/S3/FileLinkService";

export class FileLinksController {
    public static getClassName = (): string => "FileLinksController";
    private fileLinkService: FileLinkService;


    constructor(fileLinkService: FileLinkService) {
        this.fileLinkService = fileLinkService;
    }

    public async createAvatarFileLink(profileId: string): Promise<FileLink> {
        const fileLinks = await this.fileLinkService.createFileLinks(FileType.AVATAR, profileId);
        return fileLinks.pop() as FileLink;
    }

    public async createDocumentsFileLinks(numberOfLinks: number, profileId: string): Promise<FileLink[]> {
        return this.fileLinkService.createFileLinks(FileType.DOCUMENT, profileId, numberOfLinks);
    }

    public async getAvatarLink(id: string, catalog: string): Promise<FileLink> {
        return this.fileLinkService.getAvatarFileLink(id, catalog);
    }

}