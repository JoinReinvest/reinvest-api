import { ContainerInterface } from 'Container/Container';
import { Registration } from 'Registration/index';

export default class EventBusProvider {
  private config: Registration.Config;

  constructor(config: Registration.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
