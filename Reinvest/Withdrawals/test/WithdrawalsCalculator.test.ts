import { expect } from 'chai';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { SettledShares, WithdrawalsCalculator } from 'Withdrawals/Domain/WithdrawalsCalculator';

context('Given ', () => {
  describe('When', async () => {
    const settledShares: SettledShares = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numberOfShares: 1000,
      transactionDate: DateTime.daysAgo(100),
      unitPrice: Money.lowPrecision(100),
    };
    it('Then', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals(Money.lowPrecision(105), [settledShares], []);

      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$9,000.00');
      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$10,000.00');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$1,000.00');
    });
  });
});
