import { UUID } from 'HKEKTypes/Generics';
import { GeneratePdfCommand, PdfKinds } from 'HKEKTypes/Pdf';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DomainEvent } from 'SimpleAggregator/Types';

export class GenerateSubscriptionAgreement {
  static getClassName = (): string => 'GenerateSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  async execute(profileId: UUID, subscriptionAgreementId: UUID): Promise<void> {
    const events: DomainEvent[] = [];
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, subscriptionAgreementId);

    if (!subscriptionAgreement) {
      console.error(`Can not generate not existing subscription agreement ${profileId}/${subscriptionAgreementId}`);

      return;
    }

    if (!subscriptionAgreement.isSigned()) {
      console.error(`Can not generate not signed subscription agreement ${profileId}/${subscriptionAgreementId}`);

      return;
    }

    const { template, content, version } = subscriptionAgreement.forParser();
    const pdfCommand: GeneratePdfCommand = {
      id: subscriptionAgreementId,
      kind: PdfKinds.GeneratePdf,
      data: {
        catalog: profileId,
        fileName: subscriptionAgreementId,
        template,
        version,
        content,
        profileId,
        fileId: subscriptionAgreementId,
      },
    };
    events.push(pdfCommand);
    await this.subscriptionAgreementRepository.publishEvents(events);
  }
}
