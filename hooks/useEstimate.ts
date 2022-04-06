/**
 * A user borrows (sells fyToken) and then a month later returns and buys fyToken (repays)
 * We want to do the calculation with and without a fee.
 * The point is to see what the effective cost of a short term borrow is relative to the rate.
 * I think the effective rate should be equal to the spread, but I'm not sure.
 */

import { BigNumber, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect } from 'react';
import { cleanValue } from '../utils/appUtils';
import { buyBase, calculateAPR, secondsToFrom, sellBase } from '../utils/yieldMath';

const useEstimate = () => {
  useEffect(() => {
    /**
     *
     * @param {number} repayDaysLater // optional (defaults to 30 days): number of days after now and should abide by the maturity date; used to estimate repayment
     * @param {number} baseAmount // optional (defaults to 100000): amount of base being borrowed; can be 1 - 200000 (upper limit based on example pool reserves)
     * @param {boolean} hasFee // optional (defaults to true): whether to estimate using the fee
     */
    const estimateBorrowAndRepay = (repayDaysLater = 30, baseAmount = 100000, hasFee = true) => {
      const NOW_IN_SECONDS = Math.round(new Date().getTime() / 1000);
      const repayDaysLaterToSeconds = 24 * 60 * 60 * repayDaysLater;
      const getTimeTillMaturity = () => maturity - NOW_IN_SECONDS;
      const g1Default = BigNumber.from('0xc000000000000000'); // 950 / 1000
      const g2Default = BigNumber.from('0x015555555555555555'); // 1000 / 950

      const HAS_FEE = true;
      const g1 = HAS_FEE ? g1Default : ethers.constants.One;
      const g2 = HAS_FEE ? g2Default : ethers.constants.One;

      // example series data
      const baseReserves = parseUnits('200000');
      const fyTokenReserves = parseUnits('250000');
      const ts = BigNumber.from('0x0571a826b3');
      const maturity = 1656039600;
      const timeTillMaturityNow = getTimeTillMaturity().toString();
      const decimals = 18;

      // example amount of base to borrow (i.e.: 100,000)
      const base = parseUnits(baseAmount.toString());

      // calculate the amount of fyToken (debt) you would get for given base amount now
      const expectedFyTokenOutNow = buyBase(baseReserves, fyTokenReserves, base, timeTillMaturityNow, ts, g2, decimals);
      console.log(
        `Expected fyToken sold for base now (borrow): ${cleanValue(
          ethers.utils.formatUnits(expectedFyTokenOutNow, decimals),
          2
        )}`
      );

      // estimate the apr
      const borrowAPR = cleanValue(calculateAPR(base, expectedFyTokenOutNow, maturity), 2);
      console.log(`borrow apr using now: ${borrowAPR}`);

      // emulate repaying at a later time, assuming all series variables above stay the same
      const timeTillMaturityLater = secondsToFrom(
        maturity.toString(),
        (NOW_IN_SECONDS + repayDaysLaterToSeconds).toString()
      );

      const fyTokenRepaid = sellBase(baseReserves, fyTokenReserves, base, timeTillMaturityLater, ts, g1, decimals);
      console.log(
        `FyToken repaid ${repayDaysLater} days later with same series data: ${cleanValue(
          ethers.utils.formatUnits(fyTokenRepaid, decimals),
          2
        )}`
      );

      console.log(
        `Difference in fyToken borrowed now and fyToken repaid later: ${cleanValue(
          ethers.utils.formatUnits(expectedFyTokenOutNow.sub(fyTokenRepaid), 18),
          2
        )}`
      );
    };

    estimateBorrowAndRepay(30);
  }, []);
};

export default useEstimate;
