import Profile from "./Profile";

class ProfileService {
    create(userId: string) {
        const profile = new Profile(userId, {});
    }

    constructor() {

    }
}

export default ProfileService;