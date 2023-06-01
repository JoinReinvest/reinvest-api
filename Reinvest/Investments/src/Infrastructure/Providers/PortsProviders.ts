import { ContainerInterface } from 'Container/Container';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import AssignSubscriptionAgreementToInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToInvestment';
import AssignSubscriptionAgreementToRecurringInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToRecurringInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import CreateRecurringInvestment from 'Investments/Application/UseCases/CreateRecurringInvestment';
import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import DeleteRecurringInvestment from 'Investments/Application/UseCases/DeleteRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';
import { ReinvestDividend } from 'Investments/Application/UseCases/ReinvestDividend';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { Investments } from 'Investments/index';
import { DividendsController } from 'Investments/Infrastructure/Ports/DividendsController';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { RecurringInvestmentsController } from 'Investments/Infrastructure/Ports/RecurringInvestmentsController';
import { ScheduleSimulationController } from 'Investments/Infrastructure/Ports/ScheduleSimulationController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { TransactionController } from 'Investments/Infrastructure/Ports/TransactionController';
import RecurringInvestmentQuery from 'Reinvest/Investments/src/Application/UseCases/RecurringInvestmentQuery';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(TempController, [SimpleEventBus]);
    container.addSingleton(InvestmentsController, [CreateInvestment, InvestmentSummaryQuery, AssignSubscriptionAgreementToInvestment, StartInvestment]);
    container.addSingleton(SubscriptionAgreementController, [
      CreateSubscriptionAgreement,
      SubscriptionAgreementQuery,
      SignSubscriptionAgreement,
      CreateRecurringSubscriptionAgreement,
    ]);
    container.addSingleton(FeesController, [ApproveFees, IsFeeApproved]);
    container.addSingleton(ScheduleSimulationController, [ScheduleSimulationQuery]);
    container.addSingleton(RecurringInvestmentsController, [
      CreateRecurringInvestment,
      RecurringInvestmentQuery,
      DeleteRecurringInvestment,
      AssignSubscriptionAgreementToRecurringInvestment,
      InitiateRecurringInvestment,
      DeactivateRecurringInvestment,
    ]);
    container.addSingleton(DividendsController, [ReinvestDividend]);
    container.addSingleton(TransactionController, [PushTransaction]);
  }
}
