import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { InvestmentStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentFinalized, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsQueryRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsQueryRepository';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class FinalizeInvestmentEventHandler implements EventHandler<TransactionEvent> {
  private investmentsQueryRepository: InvestmentsQueryRepository;
  private eventBus: EventBus;

  constructor(investmentsQueryRepository: InvestmentsQueryRepository, eventBus: EventBus) {
    this.investmentsQueryRepository = investmentsQueryRepository;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'FinalizeInvestmentEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    const investmentId = event.id;

    const investmentDetails = await this.investmentsQueryRepository.getInvestmentDetailsForTransaction(investmentId);

    if (!investmentDetails) {
      console.error(`[FinalizeInvestmentEventHandler] Investment with id ${investmentId} not found`);

      return;
    }

    const {
      accountId,
      ip,
      tradeId,
      profileId,
      status,
      subscriptionAgreementPdfDateCreated,
      subscriptionAgreementId,
      portfolioId,
      bankAccountId,
      investmentAmount,
      feeAmount,
      feeApproveDate,
      unitPrice,
    } = investmentDetails;

    if (status !== InvestmentStatus.IN_PROGRESS) {
      console.warn(`[FinalizeInvestmentEventHandler] Investment with id ${investmentId} is not in progress. Current status: ${status}`);
    }

    if (!subscriptionAgreementId || !ip) {
      console.error(`[FinalizeInvestmentEventHandler] Subscription agreement id for investment with id ${investmentId} not found or signed or ip is not set`);

      return;
    }

    if (!subscriptionAgreementPdfDateCreated) {
      console.warn(`[FinalizeInvestmentEventHandler] Subscription agreement PDF not created for investment ${investmentId}}`);
      await this.eventBus.publish(<SubscriptionAgreementEvent>{
        id: subscriptionAgreementId,
        kind: SubscriptionAgreementEvents.GenerateSubscriptionAgreementCommand,
        data: {
          profileId,
        },
      });

      return;
    }

    if (feeAmount && !feeApproveDate) {
      const uniqueId = `fee-${investmentId}`;
      const command = {
        kind: 'CreateNotification',
        data: {
          accountId: accountId,
          profileId: profileId,
          notificationType: 'FEES_APPROVAL_REQUIRED',
          header: 'Fees approval required [COPY-TO-UPDATE]',
          body: 'One of your investment does not have fees approved. Please approve fees to continue investing.',
          dismissId: null,
          onObjectId: investmentId,
          onObjectType: 'INVESTMENT',
          uniqueId: uniqueId,
          pushNotification: {
            title: 'Fees approval required [COPY-TO-UPDATE]',
            body: 'One of your investment does not have fees approved. Please approve fees to continue investing.',
          },
        },
        id: event.id,
      };

      await this.eventBus.publish(command);

      return;
    }

    await this.eventBus.publish(<InvestmentFinalized>{
      kind: TransactionEvents.INVESTMENT_FINALIZED,
      data: {
        amount: investmentAmount,
        fees: !feeAmount ? 0 : feeAmount,
        ip,
        bankAccountId,
        subscriptionAgreementId,
        portfolioId,
        userTradeId: tradeId,
        unitPrice,
      },
      id: investmentId,
    });
  }
}
