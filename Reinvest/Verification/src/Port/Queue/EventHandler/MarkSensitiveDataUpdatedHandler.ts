import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { VerificationEvents, VerificationUserObjectUpdatedEvent } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';
import { DateTime } from 'Money/DateTime';

export enum UpdatedObjectType {
  PROFILE = 'PROFILE',
  ACCOUNT = 'ACCOUNT',
  STAKEHOLDER = 'STAKEHOLDER',
}

export type SensitiveDataUpdated = DomainEvent & {
  data: {
    accountId: string | null;
    profileId: string;
    stakeholderId: string | null;
    type: UpdatedObjectType;
  };
  kind: 'SensitiveDataUpdated';
};

export class MarkSensitiveDataUpdatedHandler implements EventHandler<DomainEvent> {
  private readonly verifierRepository: VerifierRepository;

  constructor(verifierRepository: VerifierRepository) {
    this.verifierRepository = verifierRepository;
  }

  static getClassName = (): string => 'MarkSensitiveDataUpdatedHandler';

  public async handle(event: SensitiveDataUpdated): Promise<void> {
    if (event.kind !== 'SensitiveDataUpdated') {
      return;
    }

    console.log('Sensitive data updated', event.data);
    let objectId: string;
    switch (event.data.type) {
      case 'PROFILE':
        objectId = event.data.profileId;
        break;
      case 'STAKEHOLDER':
        objectId = event.data.stakeholderId;
        break;
      case 'ACCOUNT':
        objectId = event.data.accountId;
        break;
      default:
        return;
    }

    const verifier = await this.verifierRepository.findVerifierById(objectId);

    if (!verifier) {
      return;
    }

    verifier.handleVerificationEvent(<VerificationUserObjectUpdatedEvent>{
      kind: VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED,
      date: DateTime.now().toDate(),
      ncId: verifier.getPartyId(),
    });

    await this.verifierRepository.storeVerifiers([verifier]);

    return;
  }
}
