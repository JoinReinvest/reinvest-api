import {SimpleAggregate} from "SimpleAggregator/SimpleAggregate";
import {AggregateState} from "SimpleAggregator/Types";

import {IndividualAccountOpened, ProfileCreated} from "InvestmentAccounts/Domain/ProfileEvents";
import {ProfileException} from "InvestmentAccounts/Domain/ProfileException";

const MAX_NUMBER_OF_TRUSTS = 3;
const MAX_NUMBER_OF_CORPORATES = 3;

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

    public openIndividualAccount(accountId: string) {
        const individualAccountId = this.getState("individualAccountId");

        if (individualAccountId !== null) {
            ProfileException.throw(individualAccountId === accountId ? "THE_ACCOUNT_ALREADY_OPENED" : "CANNOT_OPEN_ACCOUNT");
        }

        const event = <IndividualAccountOpened>{
            id: this.getId(),
            kind: "IndividualAccountOpened",
            data: {
                individualAccountId: accountId
            }
        };

        return this.apply(event);
    }
}

export default Profile;
