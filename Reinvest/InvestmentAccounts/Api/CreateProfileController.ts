import ProfileService from "../ProfileService";

class CreateProfileController {
    public call(userId: string) {
        const profileService = new ProfileService();
        profileService.create(userId);

        return userId;
    }
}

export default CreateProfileController;