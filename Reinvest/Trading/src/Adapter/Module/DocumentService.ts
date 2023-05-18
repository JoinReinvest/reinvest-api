export class DocumentService {
  static getClassName = () => 'DocumentService';

  async getDocumentLink(documentId: string, path: string): Promise<{ url: string }> {
    // TODO: implement call Document module to get the document link
    return {
      url: 'https://some-url.com',
    };
  }
}
