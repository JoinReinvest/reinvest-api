import Profile from "./Profile";

export class ProfileRepository {
    static toString() {
        return 'ProfileRepository';
    }

}

class ProfileService {
    private readonly profileRepository: ProfileRepository;

    static toString() {
        return 'ProfileService';
    }

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
        console.log('now!');
    }

    create(userId: string) {
        console.log("profile repository", this.profileRepository)
        const profile = Profile.create();
        const profileCreated = profile.initialize(userId);

        // this.repository.transaction(() => {
        //     this.aggregateService.persist(profile);
        //     this.eventBus.publish(profileCreated);
        // });

    }


}

export default ProfileService;