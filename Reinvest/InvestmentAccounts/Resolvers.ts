import { ContainerInterface } from "Container/Container";
import ProfileQuery from "Reinvest/InvestmentAccounts/ProfileQuery";
import ProfileService from "Reinvest/InvestmentAccounts/ProfileService";

export function createProfileResolver(
  container: ContainerInterface,
  userId: string
): void {
  const profileService = container.getClass(ProfileService) as ProfileService;

  profileService.create(userId);
}

export function getProfileByUserResolver(container: any, userId: string): any {
  const profileQuery = container.getClass(ProfileQuery) as ProfileQuery;

  return profileQuery.getProfileByUserId(userId);
}
