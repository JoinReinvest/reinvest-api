import { GeneratePdfCommand, PdfKinds } from 'HKEKTypes/Pdf';
import { DomainEvent } from 'SimpleAggregator/Types';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';

class SignFundsWithdrawalRequestAgreement {
  static getClassName = (): string => 'SignFundsWithdrawalRequestAgreement';

  private readonly fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
  ) {
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  async execute(profileId: string, accountId: string, clientIp: string) {
    const events: DomainEvent[] = [];
    const fundsRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    if (fundsRequest.isAgreementAssigned()) {
      throw new Error(WithdrawalError.WITHDRAWAL_AGREEMENT_ALREADY_SIGNED);
    }

    const fundsWithdrawalRequestsAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(fundsRequest.getId());

    if (!fundsWithdrawalRequestsAgreement) {
      throw new Error(WithdrawalError.NO_WITHDRAWAL_AGREEMENT);
    }

    fundsWithdrawalRequestsAgreement.signAgreement(clientIp);

    const isSigned = await this.fundsWithdrawalRequestsAgreementsRepository.updateFundsWithdrawalRequestAgreement(fundsWithdrawalRequestsAgreement);

    if (!isSigned) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }

    fundsRequest.assignAgreement(fundsWithdrawalRequestsAgreement.getId());
    const isAssigned = await this.fundsWithdrawalRequestsRepository.assignAgreement(fundsRequest);

    if (!isAssigned) {
      throw new Error(WithdrawalError.UNKNOWN_ERROR);
    }

    // TODO this is separate use case!
    const { template, content, version } = fundsWithdrawalRequestsAgreement.forParser();

    const pdfCommand: GeneratePdfCommand = {
      id: fundsWithdrawalRequestsAgreement.getId(),
      kind: PdfKinds.GeneratePdf,
      data: {
        catalog: profileId,
        fileName: fundsWithdrawalRequestsAgreement.getId(),
        template,
        version,
        content,
        profileId,
        fileId: fundsWithdrawalRequestsAgreement.getId(),
      },
    };

    events.push(pdfCommand);

    await this.fundsWithdrawalRequestsRepository.publishEvents(events);
  }
}

export default SignFundsWithdrawalRequestAgreement;
