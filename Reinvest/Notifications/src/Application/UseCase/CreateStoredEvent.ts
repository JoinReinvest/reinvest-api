import { DictionaryType, UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { StoredEvent } from 'Notifications/Domain/StoredEvent';
import { StoredEventKind } from 'Notifications/Domain/StoredEventsConfiguration';

export class CreateStoredEvent {
  static getClassName = (): string => 'CreateStoredEvent';
  private storedEventsRepository: StoredEventRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(storedEventsRepository: StoredEventRepository, idGenerator: IdGeneratorInterface) {
    this.storedEventsRepository = storedEventsRepository;
    this.idGenerator = idGenerator;
  }

  public async execute(profileId: UUID, kind: StoredEventKind, payload: DictionaryType, date: string): Promise<void> {
    const id = this.idGenerator.createUuid();
    const storedEvent = StoredEvent.create(id, profileId, kind, payload, DateTime.from(date));
    await this.storedEventsRepository.store(storedEvent);
  }
}
