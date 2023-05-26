import { ContainerInterface } from 'Container/Container';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import AssignSubscriptionAgreementToInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { Investments } from 'Investments/index';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { ScheduleSimulationController } from 'Investments/Infrastructure/Ports/ScheduleSimulationController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(TempController, [SimpleEventBus]);
    container.addSingleton(InvestmentsController, [CreateInvestment, InvestmentSummaryQuery, AssignSubscriptionAgreementToInvestment, StartInvestment]);
    container.addSingleton(SubscriptionAgreementController, [CreateSubscriptionAgreement, SubscriptionAgreementQuery, SignSubscriptionAgreement]);
    container.addSingleton(FeesController, [ApproveFees, IsFeeApproved]);
    container.addSingleton(ScheduleSimulationController, [ScheduleSimulationQuery]);
  }
}
