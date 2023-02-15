import {SimpleAggregate} from "SimpleAggregator/SimpleAggregate";
import {AggregateState} from "SimpleAggregator/Types";

import {ProfileCreated} from "InvestmentAccounts/Domain/ProfileEvents";

export const ProfileAggregateName = 'Profile';
export type ProfileState = AggregateState & {
    kind: 'Profile';
    state?: {
        individualAccountId: null | string,
        beneficiaryAccountIds: [string],
        corporateAccountIds: [string],
        trustAccountIds: [string],
    };
};

class Profile extends SimpleAggregate {
    // @ts-ignore
    protected aggregate: ProfileState;

    public static create(profileId: string) {
        return Profile.createAggregate(ProfileAggregateName, profileId);
    }

    public initialize(): ProfileCreated {
        const profileCreated = <ProfileCreated>{
            id: this.getId(),
            kind: "ProfileCreated",
            data: {
                individualAccountId: null,
                beneficiaryAccountIds: [],
                corporateAccountIds: [],
                trustAccountIds: [],
            }
        };

        return this.apply(profileCreated);
    }

    // command handler
    // public attachIndividual(individualId: string): IndividualAttachedToProfile {
    //     const currentIndividual = this.getState("individualId");
    //
    //     if (currentIndividual) {
    //         ProfileException.throw("Individual already attached to the profile");
    //     }
    //
    //     const event = <IndividualAttachedToProfile>{
    //         id: this.getId(),
    //         kind: "IndividualAttachedToProfile",
    //         data: {individualId}
    //     };
    //
    //
    //     return this.apply(event);
    // }
}

export default Profile;
