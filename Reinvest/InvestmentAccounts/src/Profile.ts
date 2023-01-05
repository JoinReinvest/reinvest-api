import {ProfileException} from "InvestmentAccounts/ProfileException";
import {SimpleAggregate} from "SimpleAggregator/SimpleAggregate";
import {AggregateState} from "SimpleAggregator/Types";

import {IndividualAttachedToProfile, ProfileCreated} from "InvestmentAccounts/Events";

export type ProfileState = AggregateState & {
    kind: "Profile";
    state?: {
        accountId: string[];
        individualId: string | null;
        userId: string;
    };
};

class Profile extends SimpleAggregate {
    // @ts-ignore
    protected aggregate: ProfileState;

    public static create() {
        return Profile.createAggregate("Profile");
    }

    public initialize(userId: string): ProfileCreated {
        const profileCreated = <ProfileCreated>{
            id: this.getId(),
            kind: "ProfileCreated",
            data: {
                userId,
                accountId: [],
            }
        };

        return this.apply(profileCreated);
    }

    // command handler
    public attachIndividual(individualId: string): IndividualAttachedToProfile {
        const currentIndividual = this.getState("individualId");

        if (currentIndividual) {
            ProfileException.throw("Individual already attached to the profile");
        }

        const event = <IndividualAttachedToProfile>{
            id: this.getId(),
            kind: "IndividualAttachedToProfile",
            data: {individualId}
        };


        return this.apply(event);
    }
}

export default Profile;
