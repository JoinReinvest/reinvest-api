import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { UUID } from 'HKEKTypes/Generics';

class GetRenderedPageLink {
  static getClassName = (): string => 'GetRenderedPageLink';
  private s3Adapter: S3Adapter;

  constructor(s3Adapter: S3Adapter) {
    this.s3Adapter = s3Adapter;
  }

  async execute(profileId: UUID, id: string) {
    const renderPageData = await this.s3Adapter.getRenderedPage(id, profileId);

    return renderPageData;
  }
}

export default GetRenderedPageLink;
