import { CompanyVerification } from "../../Company/Domain/CompanyVerification";
import { CompanyVerificationRepositoryInterface } from "../../Company/Domain/Repository/CompanyVerificationRepositoryInterface";
import { PersonVerification } from "../../Person/Domain/PersonVerification";
import { PersonVerificationRepositoryInterface } from "../../Person/Domain/Repository/PersonVerificationRepositoryInterface";
import { AccountVerification } from "../Domain/AccountVerification";
import { AccountVerificationRepositoryInterface } from "../Domain/Repository/AccountVerificationRepositoryInterface";
import { InvestingAccountId } from "../Domain/ValueObject/InvestingAccountId";
import { VerificationFactory } from "./Factory/VerificationFactory";
import { AccountStructureQueryInterface } from "./Query/AccountStructureQueryInterface";

export class CreateAccountVerification {
  private accountStructureQuery: AccountStructureQueryInterface;
  private accountVerificationRepository: AccountVerificationRepositoryInterface;
  private personVerificationRepository: PersonVerificationRepositoryInterface;
  private companyVerificationRepository: CompanyVerificationRepositoryInterface;

  constructor(
    accountStructureQuery: AccountStructureQueryInterface,
    accountVerificationRepository: AccountVerificationRepositoryInterface,
    personVerificationRepository: PersonVerificationRepositoryInterface,
    companyVerificationRepository: CompanyVerificationRepositoryInterface
  ) {
    this.accountStructureQuery = accountStructureQuery;
    this.accountVerificationRepository = accountVerificationRepository;
    this.personVerificationRepository = personVerificationRepository;
    this.companyVerificationRepository = companyVerificationRepository;
  }

  public create(accountId: InvestingAccountId) {
    const accountStructure =
      this.accountStructureQuery.getAccountStructure(accountId);

    this.accountVerificationRepository.save(
      new AccountVerification(accountId, accountStructure.getMembersId())
    );
    const accountVerification =
      this.accountVerificationRepository.get(accountId);

    if (
      accountVerification.isApproved() ||
      accountVerification.isWaitingForManualVerification()
    ) {
      // send event that account is already verified
      return;
    }

    const personVerifications = <PersonVerification[]>[];
    const companyVerifications = <CompanyVerification[]>[];

    for (const member of accountStructure.getMembers()) {
      const verification = VerificationFactory.createFromAccountMember(member);
      verification instanceof PersonVerification
        ? personVerifications.push(verification)
        : companyVerifications.push(verification);
    }

    this.personVerificationRepository.save(personVerifications);
    this.companyVerificationRepository.save(companyVerifications);

    // send event to check every verification state
  }
}
