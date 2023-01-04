import { ContainerInterface } from "Container/Container";
import ProfileQuery from "InvestmentAccounts/ProfileQuery";
import ProfileService from "InvestmentAccounts/ProfileService";

export async function createProfileResolver(
  container: ContainerInterface,
  userId: string
): Promise<void> {
  const profileService = container.getClass(ProfileService) as ProfileService;

  await profileService.create(userId);
}

export async function getProfileByUserResolver(container: any, userId: string): any {
  const profileQuery = container.getClass(ProfileQuery) as ProfileQuery;

  return await profileQuery.getProfileByUserId(userId);
}
