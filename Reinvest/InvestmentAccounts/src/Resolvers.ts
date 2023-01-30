import { ContainerInterface } from "Container/Container";
import ProfileQueryService from "InvestmentAccounts/ProfileQueryService";
import ProfileService from "InvestmentAccounts/ProfileService";

export async function createProfileResolver(
  container: ContainerInterface,
  userId: string
): Promise<void> {
  const profileService = container.getClass<ProfileService>(ProfileService);

  await profileService.create(userId);
}

export async function getProfileByUserResolver(container: ContainerInterface, userId: string): Promise<any> {
  const profileQuery = container.getClass<ProfileQueryService>(ProfileQueryService);

  return await profileQuery.getProfileByUserId(userId);
}
