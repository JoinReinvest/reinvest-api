import { ReinvestmentDecision, ReinvestmentDecisions } from 'Investments/Domain/Reinvestments/ReinvestmentDecisions';
import { ReinvestmentEvent, ReinvestmentEvents } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { ReinvestmentProcessManagerTypes } from 'Investments/Domain/Reinvestments/ReinvestmentProcessManagerTypes';

export class ReinvestmentProcessManager implements ReinvestmentProcessManagerTypes {
  private readonly dividendId: string;
  private profileId: string | null = null;
  private events: ReinvestmentEvent[];

  constructor(dividendId: string, events: ReinvestmentEvent[]) {
    this.dividendId = dividendId;
    this.events = events;
  }

  handleEvent(event: ReinvestmentEvent): boolean {
    const { kind, id } = event;

    if (id !== this.dividendId) {
      console.warn(`Invalid dividend id ${id}`);

      return false;
    }

    if (!this.canThisEventBeHandled(kind)) {
      console.warn(`Invalid event ${kind}`);

      return false;
    }

    if (!this.isTheSameEventAsTheLastOne(kind)) {
      console.warn(`Duplicated event ${kind}`);

      return false;
    }

    this.events.push(event);

    return true;
  }

  makeDecision(): ReinvestmentDecision {
    const { lastEvent, amount, accountId, portfolioId } = this.eventsAnalysis();

    if (!lastEvent || !this.profileId) {
      return this.decide(ReinvestmentDecisions.AWAITING_REINVESTMENT);
    }

    switch (lastEvent.kind) {
      case ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED:
        return this.decide(ReinvestmentDecisions.TRANSFER_SHARES_FOR_REINVESTMENT, { accountId, amount, portfolioId });
      case ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT:
        return this.decide(ReinvestmentDecisions.REINVESTMENT_COMPLETED);
      default:
        break;
    }

    throw new Error(`Invalid process manager state for investment ${this.dividendId}`);
  }

  private decide(decision: ReinvestmentDecisions, data: unknown = {}): ReinvestmentDecision {
    return {
      kind: decision,
      decisionId: this.events.length,
      dividendId: this.dividendId,
      profileId: this.profileId as string,
      data,
    };
  }

  private canThisEventBeHandled(kind: ReinvestmentEvents): boolean {
    const { kind: decision } = this.makeDecision();

    switch (decision) {
      case ReinvestmentDecisions.AWAITING_REINVESTMENT:
        return [ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED].includes(kind);
      case ReinvestmentDecisions.TRANSFER_SHARES_FOR_REINVESTMENT:
        return [ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT].includes(kind);
      default:
        return false;
    }
  }

  private isTheSameEventAsTheLastOne(kind: ReinvestmentEvents): boolean {
    const { lastEvent } = this.eventsAnalysis();

    if (!lastEvent) {
      return true;
    }

    return lastEvent.kind !== kind;
  }

  private eventsAnalysis(): {
    accountId: string | null;
    amount: number | null;
    lastEvent: ReinvestmentEvent | null;
    portfolioId: string | null;
  } {
    let amount = null;
    let lastEvent = null;
    let accountId = null;
    let portfolioId = null;

    for (const event of this.events) {
      lastEvent = event;
      switch (event.kind) {
        case ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED:
          accountId = event.data.accountId;
          portfolioId = event.data.portfolioId;
          amount = event.data.amount;
          this.profileId = event.data.profileId;
          break;
        default:
          break;
      }
    }

    return { accountId, lastEvent, amount, portfolioId };
  }
}
