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

  constructor(profileId: string, accountId: string) {
    this.profileId = profileId;
    this.accountId = accountId;
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
          this.updateRequired(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        case VerificationDecisionType.PROFILE_BANNED:
          this.banProfile(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        case VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED:
          this.manualVerificationRequired(investmentsVerifications, objectVerifications, requiredActions, decision);
          break;
        default: {
          investmentsVerifications.push(false);
          objectVerifications.push(false);
          break;
        }
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
  ) {
    investmentsVerifications.push(false);
    objectVerifications.push(false);
    requiredActions.push({
      action: ActionName.UPDATE_MEMBER,
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
}
