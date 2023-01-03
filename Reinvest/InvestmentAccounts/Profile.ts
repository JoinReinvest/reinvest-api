import {IndividualAttachedToProfile, ProfileCreated} from "./Events";
import {AggregateState} from "SimpleAggregator/Types";
import {SimpleAggregate} from "SimpleAggregator/SimpleAggregate";
import {ProfileException} from "Reinvest/InvestmentAccounts/ProfileException";

export type ProfileState = AggregateState & {
    kind: 'Profile',
    state?: {
        userId: string,
        individualId: string | null,
        accountId: string[]
    }
}

class Profile extends SimpleAggregate {
    // @ts-ignore
    protected aggregate: ProfileState;

    public static create() {
        return Profile.createAggregate('Profile');
    }

    public initialize(userId: string): ProfileCreated {
        const profileCreated = new ProfileCreated({
            userId,
            accountId: []
        }, this.getId())

        return this.apply(profileCreated);
    }

    // command handler
    public attachIndividual(individualId: string): IndividualAttachedToProfile {
        const currentIndividual = this.getState('individualId');
        if (currentIndividual) {
            ProfileException.throw('Individual already attached to the profile');
        }

        const event = new IndividualAttachedToProfile({individualId}, this.getId());

        return this.apply(event);
    }
}

export default Profile;