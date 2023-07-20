import { ContainerInterface } from 'Container/Container';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import { CancelInvestment } from 'Investments/Application/UseCases/CancelInvestment';
import { CreateInvestment } from 'Investments/Application/UseCases/CreateInvestment';
import { CreateInvestmentFromRecurringInvestment } from 'Investments/Application/UseCases/CreateInvestmentFromRecurringInvestment';
import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import ListInvestmentsQuery from 'Investments/Application/UseCases/ListInvestmentsQuery';
import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';
import { ReinvestDividend } from 'Investments/Application/UseCases/ReinvestDividend';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignRecurringSubscriptionAgreement from 'Investments/Application/UseCases/SignRecurringSubscriptionAgreement';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { TransferInvestments } from 'Investments/Application/UseCases/TransferInvestments';
import UnsuspendRecurringInvestment from 'Investments/Application/UseCases/UnsuspendRecurringInvestment';
import { Investments } from 'Investments/index';
import { DividendsController } from 'Investments/Infrastructure/Ports/DividendsController';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { RecurringInvestmentsController } from 'Investments/Infrastructure/Ports/RecurringInvestmentsController';
import { ScheduleSimulationController } from 'Investments/Infrastructure/Ports/ScheduleSimulationController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { TransactionController } from 'Investments/Infrastructure/Ports/TransactionController';
import CreateRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import RecurringInvestmentQuery from 'Reinvest/Investments/src/Application/UseCases/RecurringInvestmentQuery';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(TempController, [SimpleEventBus]);
    container.addSingleton(InvestmentsController, [
      CreateInvestment,
      InvestmentSummaryQuery,
      StartInvestment,
      AbortInvestment,
      ListInvestmentsQuery,
      CancelInvestment,
      TransferInvestments,
    ]);
    container.addSingleton(SubscriptionAgreementController, [
      CreateSubscriptionAgreement,
      SubscriptionAgreementQuery,
      SignSubscriptionAgreement,
      SignRecurringSubscriptionAgreement,
      CreateRecurringSubscriptionAgreement,
    ]);
    container.addSingleton(FeesController, [ApproveFees, IsFeeApproved]);
    container.addSingleton(ScheduleSimulationController, [ScheduleSimulationQuery]);
    container.addSingleton(RecurringInvestmentsController, [
      CreateRecurringInvestment,
      RecurringInvestmentQuery,
      InitiateRecurringInvestment,
      DeactivateRecurringInvestment,
      UnsuspendRecurringInvestment,
      CreateInvestmentFromRecurringInvestment,
    ]);
    container.addSingleton(DividendsController, [ReinvestDividend]);
    container.addSingleton(TransactionController, [PushTransaction]);
  }
}
