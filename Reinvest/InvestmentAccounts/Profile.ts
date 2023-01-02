import {createEvent, IndividualAttachedToProfile, ProfileCreated, ProfileEvent, profileEvents} from "./Events";

import Aggregate from "../../shared/SimpleAggregator/Aggregate";
import {AggregateState} from "../../shared/SimpleAggregator/AggregateState";
import {AttachIndividualToProfile, ProfileCommand, profileCommands} from "InvestmentAccounts/Commands";

export type ProfileState = AggregateState & {
    state?: {
        individualId: string,
    }
}

const defaultState = {}

class Profile implements Aggregate {
    private state: ProfileState;

    constructor(state: ProfileState) {
        this.state = state;
    }

    execute(command: ProfileCommand): ProfileEvent | ProfileEvent[] {
        switch (command.kind) {
            case profileCommands.CreateProfile:
                return this.create();
            case profileCommands.AttachIndividualToProfile:
                const {data: {individualId}} = <AttachIndividualToProfile>command;

                return this.attachIndividual(individualId);
            default:
                throw new Error('Not known command');
        }

    }

    private create(): ProfileCreated {
        const event = createEvent<ProfileCreated>(profileEvents.ProfileCreated, {...defaultState});

        return this.apply<ProfileCreated>(event);
    }

    // command handler
    private attachIndividual(individualId: string): IndividualAttachedToProfile {
        const event = <IndividualAttachedToProfile>createEvent(profileEvents.IndividualAttachedToProfile, {individualId});
        this.apply(event);

        return event;
    }

    // event apply
    public apply<Event>(event: ProfileEvent): Event {
        this.state.state = {...this.state.state, ...event.data};

        return <Event>event;
    }

    public getSnapshot(): ProfileState {
        return this.state;
    }
}

export default Profile;