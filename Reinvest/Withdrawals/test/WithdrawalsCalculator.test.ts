import { expect } from 'chai';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { AwaitingDividend, SettledShares, WithdrawalsCalculator } from 'Withdrawals/Domain/WithdrawalsCalculator';

context('Given I am investor who invested in the app', () => {
  describe('When I want to withdraw my funds after 100 days', async () => {
    const settledShares: SettledShares = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numberOfShares: 1000,
      transactionDate: DateTime.daysAgo(100),
      unitPrice: Money.lowPrecision(100),
      currentNavPerShare: Money.lowPrecision(105),
    };
    it('Then I should be able to withdraw only around 80% of my total account value', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledShares], []);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$1,050.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$837.26');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$212.74');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$1,050.00');
    });
    it('Then it should sum all my transactions into one correctly', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledShares, settledShares], []);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$2,100.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$1,674.52');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$425.48');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$2,100.00');
    });
  });
  describe('When I want to withdraw my funds exactly after 5 years', async () => {
    const settledSharesWithoutFee: SettledShares = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numberOfShares: 1000,
      transactionDate: DateTime.daysAgo(5 * 365),
      unitPrice: Money.lowPrecision(100),
      currentNavPerShare: Money.lowPrecision(105),
    };
    const settledSharesWithFee: SettledShares = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numberOfShares: 1000,
      transactionDate: DateTime.daysAgo(100),
      unitPrice: Money.lowPrecision(100),
      currentNavPerShare: Money.lowPrecision(105),
    };
    it('Then I should be able to withdraw all my current total account value', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledSharesWithoutFee], []);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$1,050.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$1,050.00');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$0.00');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$1,050.00');
    });
    it('Then it should sum all my transactions into one correctly, even if they were made later and have fees', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledSharesWithoutFee, settledSharesWithFee], []);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$2,100.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$1,887.26');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$212.74');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$2,100.00');
    });
  });
  describe('When I want to withdraw my funds, but I have some pending dividends', async () => {
    const settledSharesWithoutFee: SettledShares = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numberOfShares: 1000,
      transactionDate: DateTime.daysAgo(5 * 365),
      unitPrice: Money.lowPrecision(100),
      currentNavPerShare: Money.lowPrecision(105),
    };

    const positiveDividend: AwaitingDividend = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      totalDividendAmount: Money.lowPrecision(40000),
      totalFeeAmount: Money.lowPrecision(5000),
    };

    const negativeDividend: AwaitingDividend = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      totalDividendAmount: Money.lowPrecision(4000),
      totalFeeAmount: Money.lowPrecision(5000),
    };

    it('Then I should be able to withdraw all my current total account value that includes dividends and dividends fees', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledSharesWithoutFee], [positiveDividend]);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$1,050.00');
      expect(eligibleWithdrawals.totalDividends.getFormattedAmount()).to.be.equal('$400.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$1,400.00');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$50.00');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$1,450.00');
    });

    it('Then I should be able to withdraw all my current total account value that includes dividends and dividends fees, even if the dividend is negative', async () => {
      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals([settledSharesWithoutFee], [positiveDividend, negativeDividend]);

      expect(eligibleWithdrawals.totalFunds.getFormattedAmount()).to.be.equal('$1,050.00');
      expect(eligibleWithdrawals.totalDividends.getFormattedAmount()).to.be.equal('$440.00');
      expect(eligibleWithdrawals.eligibleFunds.getFormattedAmount()).to.be.equal('$1,390.00');
      expect(eligibleWithdrawals.totalFee.getFormattedAmount()).to.be.equal('$100.00');
      expect(eligibleWithdrawals.accountValue.getFormattedAmount()).to.be.equal('$1,490.00');
    });
  });
});
