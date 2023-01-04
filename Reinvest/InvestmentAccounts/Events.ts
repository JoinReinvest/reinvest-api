import {
  DomainEvent,
  DomainEventInterface,
  Uninitialized,
} from "SimpleAggregator/Types";

export class ProfileCreated
  extends DomainEvent
  implements DomainEventInterface
{
  public kind = "ProfileCreated";
  public data:
    | Uninitialized
    | {
        userId: string;
      } = null;
}

export class IndividualAttachedToProfile
  extends DomainEvent
  implements DomainEventInterface
{
  public kind = "IndividualAttachedToProfile";
  public data:
    | Uninitialized
    | {
        individualId: string;
      } = null;
}
