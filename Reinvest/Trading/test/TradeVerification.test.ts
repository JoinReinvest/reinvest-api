import { expect } from 'chai';
import { DateTime } from 'Money/DateTime';
import { TradeApprovalStatus, TradeVerification } from 'Trading/Domain/TradeVerification';

context('Given an investor created a trade and waiting for approval by the principal', () => {
  describe('When principal approves it', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.APPROVED,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: '',
    });

    it('Then trade verification should be verified', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.isVerified()).to.be.true;
      expect(tradeVerification.isRejected()).to.be.false;
      expect(tradeVerification.isPending()).to.be.false;
      expect(tradeVerification.needMoreInfo()).to.be.false;
    });
  });

  describe('When principal disapproves it', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.DISAPPROVED,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: '',
    });

    it('Then trade verification should be rejected', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.isVerified()).to.be.false;
      expect(tradeVerification.isRejected()).to.be.true;
      expect(tradeVerification.isPending()).to.be.false;
      expect(tradeVerification.needMoreInfo()).to.be.false;
    });
  });

  describe('When principal adds info in field3 that needs more info', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.PENDING,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: 'Trulioo was not able to pull beneficial owner information, please provide 5/10/23',
    });

    it('Then trade verification should need more info', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.isVerified()).to.be.false;
      expect(tradeVerification.isRejected()).to.be.false;
      expect(tradeVerification.isPending()).to.be.true;
      expect(tradeVerification.needMoreInfo()).to.be.true;
    });
  });

  describe('When principal adds info in field3 that needs more info and set decision to "under review"', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.UNDER_REVIEW,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: 'Trulioo was not able to pull beneficial owner information, please provide 5/10/23',
    });

    it('Then trade verification should need more info', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.isVerified()).to.be.false;
      expect(tradeVerification.isRejected()).to.be.false;
      expect(tradeVerification.isPending()).to.be.true;
      expect(tradeVerification.needMoreInfo()).to.be.true;
    });
  });

  describe('When trade approval is in pending state and the field3 message is empty', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.PENDING,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: '',
    });

    it('Then trade verification should be in the pending state and should wait for principal decision', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.isVerified()).to.be.false;
      expect(tradeVerification.isRejected()).to.be.false;
      expect(tradeVerification.isPending()).to.be.true;
      expect(tradeVerification.needMoreInfo()).to.be.false;
    });
  });

  describe('When principal provides the id of beneficial owner', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.PENDING,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: 'Beneficial owner P1952340 was flagged, 5/10/23',
    });

    it('Then system should take it under consideration', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.getObjectIds()[0]).to.be.equal('P1952340');
      expect(tradeVerification.getLastEvent()?.parsedMessage?.date).to.be.equal('5/10/23');
    });
  });

  describe('When principal provides more then one id of beneficial owners', async () => {
    const tradeVerification = new TradeVerification();
    tradeVerification.handle({
      approvalStatus: TradeApprovalStatus.PENDING,
      changeDate: DateTime.now().toFormattedDate('MM-DD-YYYY'),
      message: 'Beneficial owners P1952340, P1949230, E1308855 were flagged, 05/10/23',
    });

    it('Then system should take it under consideration', async () => {
      tradeVerification.makeDecision();
      expect(tradeVerification.getObjectIds()[0]).to.be.equal('P1952340');
      expect(tradeVerification.getObjectIds()[1]).to.be.equal('P1949230');
      expect(tradeVerification.getObjectIds()[2]).to.be.equal('E1308855');
      expect(tradeVerification.getLastEvent()?.parsedMessage?.date).to.be.equal('05/10/23');
    });
  });
});
