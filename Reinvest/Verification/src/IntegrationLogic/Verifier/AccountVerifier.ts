import {
  AccountVerificationDecision,
  ActionName,
  VerificationAction,
  VerificationDecision,
  VerificationDecisionType,
} from 'Verification/Domain/ValueObject/VerificationDecision';

export class AccountVerifier {
  private profileId: string;
  private accountId: string;
  private accountType: 'INDIVIDUAL' | 'COMPANY';

  constructor(profileId: string, accountId: string, accountType: 'INDIVIDUAL' | 'COMPANY') {
    this.profileId = profileId;
    this.accountId = accountId;
    this.accountType = accountType;
  }

  makeAccountVerificationDecision(membersDecisions: VerificationDecision[]): AccountVerificationDecision {
    const investmentsVerifications: boolean[] = [];
    const objectVerifications: boolean[] = [];
    const requiredActions: VerificationAction[] = [];

    for (const decision of membersDecisions) {
      switch (decision.decision) {
        case VerificationDecisionType.APPROVED:
          this.approve(investmentsVerifications, objectVerifications);
          break;
        case VerificationDecisionType.WAIT_FOR_SUPPORT:
          this.requireAdminSupport(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        case VerificationDecisionType.UPDATE_REQUIRED:
        case VerificationDecisionType.ENTITY_UPDATE_REQUIRED:
          this.updateRequired(investmentsVerifications, objectVerifications, requiredActions, decision, false);
          break;
        case VerificationDecisionType.SECOND_UPDATE_REQUIRED:
          this.updateRequired(investmentsVerifications, objectVerifications, requiredActions, decision, true);
          break;
        case VerificationDecisionType.PROFILE_BANNED:
          this.banProfile(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        case VerificationDecisionType.ACCOUNT_BANNED:
          this.banAccount(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        case VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED:
        case VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED:
        case VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED:
          this.manualVerificationRequired(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        default:
          console.warn(`Unknown decision type in account verifier ${decision.decision}`, decision);
          investmentsVerifications.push(false);
          objectVerifications.push(false);
          break;
      }
    }

    return {
      canUserContinueTheInvestment: investmentsVerifications.reduce((a, b) => a && b, true),
      isAccountVerified: objectVerifications.reduce((a, b) => a && b, true),
      requiredActions,
    };
  }

  private approve(investmentsVerifications: boolean[], objectVerifications: boolean[]) {
    investmentsVerifications.push(true);
    objectVerifications.push(true);
  }

  private requireAdminSupport(
    investmentsVerifications: boolean[],
    objectVerifications: boolean[],
    requiredActions: VerificationAction[],
    decision: VerificationDecision,
  ) {
    investmentsVerifications.push(true);
    objectVerifications.push(false);
    requiredActions.push({
      action: ActionName.REQUIRE_ADMIN_SUPPORT,
      onObject: decision.onObject,
      reasons: decision.reasons,
    });
  }

  private updateRequired(
    investmentsVerifications: boolean[],
    objectVerifications: boolean[],
    requiredActions: VerificationAction[],
    decision: VerificationDecision,
    again: boolean,
  ) {
    investmentsVerifications.push(false);
    objectVerifications.push(false);
    requiredActions.push({
      action: again ? ActionName.UPDATE_MEMBER_AGAIN : ActionName.UPDATE_MEMBER,
      onObject: decision.onObject,
      reasons: decision.reasons,
    });
  }

  private banProfile(
    investmentsVerifications: boolean[],
    objectVerifications: boolean[],
    requiredActions: VerificationAction[],
    decision: VerificationDecision,
  ) {
    investmentsVerifications.push(false);
    objectVerifications.push(false);
    requiredActions.push({
      action: ActionName.BAN_PROFILE,
      onObject: decision.onObject,
      reasons: decision.reasons,
    });
  }

  private banAccount(
    investmentsVerifications: boolean[],
    objectVerifications: boolean[],
    requiredActions: VerificationAction[],
    decision: VerificationDecision,
  ) {
    investmentsVerifications.push(false);
    objectVerifications.push(false);
    requiredActions.push({
      action: ActionName.BAN_ACCOUNT,
      onObject: decision.onObject,
      reasons: decision.reasons,
    });
  }

  private manualVerificationRequired(
    investmentsVerifications: boolean[],
    objectVerifications: boolean[],
    requiredActions: VerificationAction[],
    decision: VerificationDecision,
  ) {
    investmentsVerifications.push(true);
    objectVerifications.push(false);
    requiredActions.push({
      action: ActionName.REQUIRE_MANUAL_REVIEW,
      onObject: decision.onObject,
    });
  }

  isIndividual(): boolean {
    return this.accountType === 'INDIVIDUAL';
  }
}
