// Handle ProfileCompleted event
// Retrieve Profile from Legal Entities
// Mapping Profile to North Capital Main Party
// Register Main Party to North Capital

import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";
import {EventHandler} from "SimpleAggregator/EventBus/EventBus";

export class ProfileCompletedEventHandler implements EventHandler<LegalProfileCompleted> {
    static getClassName = (): string => 'ProfileCompletedEventHandler';

    public async handle(event: LegalProfileCompleted): Promise<void> {
        console.log('this is event handler for ProfileCompleted event');
    }
}