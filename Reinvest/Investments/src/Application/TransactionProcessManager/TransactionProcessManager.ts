import { TransactionDecision, TransactionDecisions } from 'Investments/Domain/Transaction/TransactionDecisions';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { TransactionProcessManagerTypes } from 'Investments/Domain/Transaction/TransactionProcessManagerTypes';
import { DateTime } from 'Money/DateTime';

const RETRY_PAYMENT_AFTER_DAYS = 1;

export class TransactionProcessManager implements TransactionProcessManagerTypes {
  private readonly investmentId: string;
  private profileId: string | null = null;
  private events: TransactionEvent[];

  constructor(investmentId: string, events: TransactionEvent[]) {
    this.investmentId = investmentId;
    this.events = events;
  }

  handleEvent(event: TransactionEvent): boolean {
    const { kind, id } = event;

    if (id !== this.investmentId) {
      console.warn(`Invalid investment id ${id}`);

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

  makeDecision(): TransactionDecision {
    const { lastEvent, amount, fees, accountId, ip, bankAccountId, subscriptionAgreementId, portfolioId, parentId, userTradeId, lastEventDate } =
      this.eventsAnalysis();

    if (!lastEvent || !this.profileId) {
      return this.decide(TransactionDecisions.AWAITING_INVESTMENT);
    }

    switch (lastEvent.kind) {
      case TransactionEvents.INVESTMENT_CREATED:
        return this.decide(TransactionDecisions.VERIFY_ACCOUNT, { accountId: parentId! });
      case TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT:
        return this.decide(TransactionDecisions.FINALIZE_INVESTMENT);
      case TransactionEvents.INVESTMENT_FINALIZED:
        return this.decide(TransactionDecisions.CREATE_TRADE, {
          accountId,
          amount,
          fees,
          ip,
          bankAccountId,
          subscriptionAgreementId,
          portfolioId,
          parentId,
          userTradeId,
        });
      case TransactionEvents.TRADE_CREATED:
        return this.decide(TransactionDecisions.CHECK_IS_INVESTMENT_FUNDED);
      case TransactionEvents.INVESTMENT_FUNDED:
        return this.decide(TransactionDecisions.CHECK_IS_INVESTMENT_APPROVED);
      case TransactionEvents.INVESTMENT_APPROVED:
        return this.decide(TransactionDecisions.CHECK_IF_GRACE_PERIOD_ENDED);
      case TransactionEvents.GRACE_PERIOD_ENDED:
        return this.decide(TransactionDecisions.MARK_FUNDS_AS_READY_TO_DISBURSE);
      case TransactionEvents.MARKED_AS_READY_TO_DISBURSE:
        return this.decide(TransactionDecisions.TRANSFER_SHARES_WHEN_TRADE_SETTLED);
      case TransactionEvents.INVESTMENT_SHARES_TRANSFERRED:
        return this.decide(TransactionDecisions.FINISH_INVESTMENT);
      case TransactionEvents.INVESTMENT_FINISHED:
        return this.decide(TransactionDecisions.DO_NOTHING);
      case TransactionEvents.PAYMENT_FAILED:
        return this.decide(TransactionDecisions.RETRY_PAYMENT, {
          retryAfterDate: lastEventDate ? lastEventDate!.addDays(RETRY_PAYMENT_AFTER_DAYS) : DateTime.now().addDays(RETRY_PAYMENT_AFTER_DAYS),
        });
      case TransactionEvents.PAYMENT_MISMATCH:
      case TransactionEvents.SECOND_PAYMENT_FAILED:
      case TransactionEvents.VERIFICATION_REJECTED_FOR_INVESTMENT:
      case TransactionEvents.INVESTMENT_REJECTED_BY_PRINCIPAL:
      case TransactionEvents.TRANSACTION_REVERTED_UNWINDING:
        return this.decide(TransactionDecisions.REVERT_TRANSACTION);
      case TransactionEvents.INVESTMENT_CANCELED:
      case TransactionEvents.TRANSACTION_CANCELED_UNWINDING:
        return this.decide(TransactionDecisions.CANCEL_TRANSACTION);
      case TransactionEvents.TRANSACTION_CANCELED:
      case TransactionEvents.TRANSACTION_REVERTED:
        return this.decide(TransactionDecisions.DO_NOTHING);
      case TransactionEvents.TRANSACTION_CANCELED_FAILED:
      case TransactionEvents.TRANSACTION_REVERTED_FAILED:
        return this.decide(TransactionDecisions.DO_NOTHING); // TODO something?
      default:
        break;
    }

    throw new Error(`Invalid process manager state for investment ${this.investmentId}`);
  }

  private decide(decision: TransactionDecisions, data: unknown = {}): TransactionDecision {
    return {
      kind: decision,
      decisionId: this.events.length,
      investmentId: this.investmentId,
      profileId: this.profileId as string,
      data,
    };
  }

  private canThisEventBeHandled(kind: TransactionEvents): boolean {
    const { kind: decision } = this.makeDecision();

    switch (decision) {
      case TransactionDecisions.AWAITING_INVESTMENT:
        return [TransactionEvents.INVESTMENT_CREATED, TransactionEvents.INVESTMENT_CANCELED].includes(kind);
      case TransactionDecisions.VERIFY_ACCOUNT:
        return [
          TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT,
          TransactionEvents.INVESTMENT_CANCELED,
          TransactionEvents.VERIFICATION_REJECTED_FOR_INVESTMENT,
        ].includes(kind);
      case TransactionDecisions.FINALIZE_INVESTMENT:
        return [TransactionEvents.INVESTMENT_FINALIZED, TransactionEvents.INVESTMENT_CANCELED].includes(kind);
      case TransactionDecisions.CREATE_TRADE:
        return [TransactionEvents.TRADE_CREATED, TransactionEvents.INVESTMENT_CANCELED, TransactionEvents.PAYMENT_MISMATCH].includes(kind); // cancel investment
      case TransactionDecisions.CHECK_IS_INVESTMENT_FUNDED:
        return [TransactionEvents.INVESTMENT_FUNDED, TransactionEvents.INVESTMENT_CANCELED, TransactionEvents.PAYMENT_FAILED].includes(kind); // unwind investment
      case TransactionDecisions.CHECK_IS_INVESTMENT_APPROVED:
        return [TransactionEvents.INVESTMENT_APPROVED, TransactionEvents.INVESTMENT_CANCELED, TransactionEvents.INVESTMENT_REJECTED_BY_PRINCIPAL].includes(
          kind,
        );
      case TransactionDecisions.RETRY_PAYMENT:
        return [TransactionEvents.SECOND_PAYMENT_FAILED, TransactionEvents.INVESTMENT_CANCELED, TransactionEvents.INVESTMENT_FUNDED].includes(kind);
      case TransactionDecisions.CHECK_IF_GRACE_PERIOD_ENDED:
        return [TransactionEvents.GRACE_PERIOD_ENDED, TransactionEvents.INVESTMENT_CANCELED].includes(kind);
      case TransactionDecisions.MARK_FUNDS_AS_READY_TO_DISBURSE:
        return [TransactionEvents.MARKED_AS_READY_TO_DISBURSE].includes(kind);
      case TransactionDecisions.TRANSFER_SHARES_WHEN_TRADE_SETTLED:
        return [TransactionEvents.INVESTMENT_SHARES_TRANSFERRED].includes(kind);
      case TransactionDecisions.FINISH_INVESTMENT:
        return [TransactionEvents.INVESTMENT_FINISHED].includes(kind);
      case TransactionDecisions.CANCEL_TRANSACTION:
        return [
          TransactionEvents.TRANSACTION_CANCELED,
          TransactionEvents.TRANSACTION_CANCELED_FAILED,
          TransactionEvents.TRANSACTION_CANCELED_UNWINDING,
        ].includes(kind);
      case TransactionDecisions.REVERT_TRANSACTION:
        return [
          TransactionEvents.TRANSACTION_REVERTED,
          TransactionEvents.TRANSACTION_REVERTED_FAILED,
          TransactionEvents.TRANSACTION_REVERTED_UNWINDING,
        ].includes(kind);
      default:
        return false;
    }
  }

  private isTheSameEventAsTheLastOne(kind: TransactionEvents): boolean {
    const { lastEvent } = this.eventsAnalysis();

    if (!lastEvent) {
      return true;
    }

    return lastEvent.kind !== kind;
  }

  private eventsAnalysis(): {
    accountId: string | null;
    amount: number | null;
    bankAccountId: string | null;
    fees: number | null;
    ip: string | null;
    lastEvent: TransactionEvent | null;
    lastEventDate: DateTime | null;
    parentId: string | null;
    portfolioId: string | null;
    subscriptionAgreementId: string | null;
    userTradeId: string | null;
  } {
    let amount = null;
    let fees = null;
    let subscriptionAgreementId = null;
    let lastEvent = null;
    let accountId = null;
    let ip = null;
    let bankAccountId = null;
    let portfolioId = null;
    let parentId = null;
    let userTradeId = null;
    let lastEventDate = null;

    for (const event of this.events) {
      lastEvent = event;
      lastEventDate = event.date ? DateTime.from(event.date) : DateTime.now();
      switch (event.kind) {
        case TransactionEvents.INVESTMENT_CREATED:
          accountId = event.data.accountId;
          parentId = event.data.parentId ?? accountId;
          this.profileId = event.data.profileId;
          break;
        case TransactionEvents.INVESTMENT_FINALIZED:
          amount = event.data.amount;
          fees = event.data.fees;
          ip = event.data.ip;
          bankAccountId = event.data.bankAccountId;
          subscriptionAgreementId = event.data.subscriptionAgreementId;
          portfolioId = event.data.portfolioId;
          userTradeId = event.data.userTradeId;
          break;
        default:
          break;
      }
    }

    return {
      accountId,
      lastEvent,
      amount,
      fees,
      subscriptionAgreementId,
      ip,
      bankAccountId,
      portfolioId,
      parentId,
      userTradeId,
      lastEventDate,
    };
  }
}
