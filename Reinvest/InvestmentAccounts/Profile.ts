import ProfileState from "./ProfileState";
import {IndividualAttachedToProfile} from "./Events";


class Profile {
    private userId: string;
    private state: ProfileState;

    constructor(userId: string, state: ProfileState = {}) {
        this.userId = userId;
        this.state = state;
    }

    // command handler
    public attachIndividual(individualId: string): IndividualAttachedToProfile {
        const event = new IndividualAttachedToProfile(individualId);
        this.apply(event);

        return event;
    }

    // event apply
    public apply(event: any) {
        if (event instanceof IndividualAttachedToProfile) {
            this.setState({
                individualId: event.individualId
            })
        }
    }

    private setState(newState: any) {
        this.state = {...this.state, ...newState};
    }
}

export default Profile;