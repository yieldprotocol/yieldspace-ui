// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken, MockToken, ReimbursementPool } from "../typechain/";
import { deployMockToken, deployRiToken, toWad, wmul } from "./utils";
import { BigNumberish } from "ethers";

// Conevenience variables
const { deployContract, loadFixture, deployMockContract } = waffle;
const { parseUnits } = ethers.utils;
const { AddressZero, MaxUint256 } = ethers.constants;

// Test inputs
const tokenName = "Reimbursement Token";
const tokenSymbol = "RIT";
const maturityTimeDiff = 15 * 60; // 15 minutes in the future
const maturityDate = Math.ceil(Date.now() / 1000) + maturityTimeDiff; // Unix timestamp time diff seconds in the future
const riTokenSupply = parseUnits("1000000", 18); // 1 million
const treasuryTokenDecimals = 6;
const treasuryTokenSupply = parseUnits("1000000000", treasuryTokenDecimals); // 1 billion
const collateralTokenDecimals = 8;
const collateralTokenSupply = parseUnits("21000000", collateralTokenDecimals); // 21 million
// 3:1 treasury token for riToken exchange rate
const humanTargetExchangeRate = "3";
const targetExchangeRate = toWad(parseUnits(humanTargetExchangeRate, treasuryTokenDecimals), treasuryTokenDecimals);
const treasuryTokenDepositAmount = parseUnits("1000", treasuryTokenDecimals);

const deployPool = (deployer: SignerWithAddress, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("ReimbursementPool");
  return deployContract(deployer, artifact, params) as Promise<ReimbursementPool>;
};

const deployMockRiToken = async (deployer: SignerWithAddress, maturity: BigNumberish, underlying: string) => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  const mockContract = await deployMockContract(deployer, artifact.abi);
  await mockContract.mock.maturity.returns(maturity);
  await mockContract.mock.underlying.returns(underlying);
  return mockContract;
};

const fastForward = async (seconds: number): Promise<void> => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let redeemer: SignerWithAddress;
  let riToken: ReimbursementToken;
  let riPool: ReimbursementPool;
  let treasuryToken: MockToken;
  let collateralToken: MockToken;

  before(async () => {
    [deployer, supplier, redeemer] = await ethers.getSigners();
  });

  async function setup() {
    // create treasury token and mint to deployer
    const treasuryToken = await deployMockToken(deployer, "Stable Coin", "STAB", treasuryTokenDecimals);
    await treasuryToken.mint(deployer.address, treasuryTokenSupply);

    // create riToken
    const riToken = await deployRiToken(deployer, [
      tokenName,
      tokenSymbol,
      maturityDate,
      treasuryToken.address,
      riTokenSupply,
      redeemer.address,
    ]);

    // create collateral token and mint to deployer
    const collateralToken = await deployMockToken(deployer, "Governance Token", "GOV", collateralTokenDecimals);
    await collateralToken.mint(deployer.address, collateralTokenSupply);

    // create riPool
    const riPool = await deployPool(deployer, [riToken.address, collateralToken.address, targetExchangeRate]);

    // approve riPool for deployer
    await treasuryToken.approve(riPool.address, MaxUint256);

    // tranfer tokens & approve riPool for supplier
    await treasuryToken.transfer(supplier.address, treasuryTokenDepositAmount);
    await treasuryToken.connect(supplier).approve(riPool.address, MaxUint256);

    // approve riPool to transfer riTokens for redeemer
    await riToken.connect(redeemer).approve(riPool.address, MaxUint256);

    return { treasuryToken, riToken, collateralToken, riPool };
  }

  beforeEach(async () => {
    ({ treasuryToken, riToken, collateralToken, riPool } = await loadFixture(setup));
  });

  describe("deployment and setup", () => {
    it("should set the deployed pool contract with the correct configuration", async () => {
      expect(await riPool.riToken()).to.equal(riToken.address);
      expect(await riPool.treasuryToken()).to.equal(treasuryToken.address);
      expect(await riPool.collateralToken()).to.equal(collateralToken.address);
      expect(await riPool.maturity()).to.equal(maturityDate);
      expect(await riPool.targetExchangeRate()).to.equal(targetExchangeRate);
    });

    it("should allow the pool contract to be deployed with no collateral token", async () => {
      const riPool = await deployPool(deployer, [riToken.address, AddressZero, targetExchangeRate]);
      expect(await riPool.collateralToken()).to.equal(AddressZero);
    });

    it("should revert if the collateral token is set to a non-contract address", async () => {
      const fakeCollateralTokenAddr = ethers.Wallet.createRandom().address;
      await expect(deployPool(deployer, [riToken.address, fakeCollateralTokenAddr, targetExchangeRate])).to.be.reverted;
    });

    it("should revert if the collateral token has 0 supply", async () => {
      const badCollateralToken = await deployMockToken(deployer);
      await expect(
        deployPool(deployer, [riToken.address, badCollateralToken.address, targetExchangeRate]),
      ).to.be.revertedWith("ReimbursementPool: Collateral Token must have non-zero supply");
    });

    it("should revert if the maturity exchange rate is 0", async () => {
      await expect(deployPool(deployer, [riToken.address, collateralToken.address, 0])).to.be.revertedWith(
        "ReimbursementPool: Target exchange rate must be non-zero",
      );
    });

    it("should revert if the treasury token has 0 supply", async () => {
      const badTreasuryToken = await deployMockToken(deployer);
      const mockRiToken = await deployMockRiToken(deployer, maturityDate, badTreasuryToken.address);

      await expect(
        deployPool(deployer, [mockRiToken.address, collateralToken.address, targetExchangeRate]),
      ).to.be.revertedWith("ReimbursementPool: Treasury Token must have non-zero supply");
    });

    it("should revert if the maturity date is in the past", async () => {
      const lastBlock = await ethers.provider.getBlock("latest");
      const recentPast = lastBlock.timestamp - 1000;
      const mockRiToken = await deployMockRiToken(deployer, recentPast, treasuryToken.address);

      await expect(
        deployPool(deployer, [mockRiToken.address, collateralToken.address, targetExchangeRate]),
      ).to.be.revertedWith("ReimbursementPool: Token maturity must be in the future");
    });
  });

  describe("supplying assets", () => {
    it("should allow contributions of the treasury token", async () => {
      await riPool.depositToTreasury(treasuryTokenDepositAmount);

      // check internal accounting
      const treasuryBalance = await riPool.treasuryBalance();
      expect(treasuryBalance).to.equal(treasuryTokenDepositAmount);

      // check actual transfer
      expect(await treasuryToken.balanceOf(riPool.address)).to.equal(treasuryBalance);
    });

    it("should allow treasury token contributions from anyone", async () => {
      await riPool.depositToTreasury(treasuryTokenDepositAmount);
      await riPool.connect(supplier).depositToTreasury(treasuryTokenDepositAmount);

      // check internal accounting
      const treasuryBalance = await riPool.treasuryBalance();
      expect(treasuryBalance).to.equal(treasuryTokenDepositAmount.mul(2));

      // check actual transfer
      expect(await treasuryToken.balanceOf(riPool.address)).to.equal(treasuryBalance);
    });

    it("should emit an event when a contribution is made", async () => {
      await expect(riPool.connect(supplier).depositToTreasury(treasuryTokenDepositAmount))
        .to.emit(riPool, "TreasuryDeposit")
        .withArgs(supplier.address, treasuryTokenDepositAmount);
    });

    it("should reduce the shortfall when a contribution is made", async () => {
      const preShortfall = await riPool.currentShortfall();

      expect(preShortfall).to.equal(await riPool.couponDebt());

      await riPool.depositToTreasury(treasuryTokenDepositAmount);

      const postShortfall = await riPool.currentShortfall();
      expect(preShortfall.sub(treasuryTokenDepositAmount)).to.equal(postShortfall);
      expect(await riPool.currentSurplus()).to.equal(0);
    });

    it("should show a surplus if greater than coupon debt is contributed", async () => {
      const preShortfall = await riPool.currentShortfall();
      const preSurplus = await riPool.currentSurplus();

      expect(preSurplus).to.equal(0);

      await riPool.depositToTreasury(preShortfall); // pay the full debt
      await riPool.depositToTreasury(treasuryTokenDepositAmount); // pay some extra

      const postShortfall = await riPool.currentShortfall();
      const postSurplus = await riPool.currentSurplus();

      expect(postShortfall).to.equal(0);
      expect(postSurplus).to.equal(treasuryTokenDepositAmount);
    });

    it("should show no shortfall or surplus if exactly the coupon debt has been contributed", async () => {
      // pay the full debt
      await riPool.depositToTreasury(await riPool.couponDebt());

      const shortfall = await riPool.currentShortfall();
      const surplus = await riPool.currentSurplus();

      expect(shortfall).to.equal(0);
      expect(surplus).to.equal(0);
    });
  });

  describe("maturity", () => {
    it("should not mature before the maturity date", async () => {
      await expect(riPool.mature()).to.be.revertedWith("ReimbursementPool: Cannot mature before maturity date");
    });

    it("should mature after the maturity date", async () => {
      await fastForward(maturityTimeDiff);
      await riPool.mature();
      expect(await riPool.hasMatured()).to.be.true;
    });

    it("should show the right final exchange rate after the maturity date", async () => {
      const totalDebt = await riPool.couponDebt();

      // Pay half the debt
      riPool.depositToTreasury(totalDebt.div(2));

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      // Exchange rate should be half that expected and 0 surplus
      const finalExchangeRate = await riPool.finalExchangeRate();
      expect(finalExchangeRate.mul(2)).to.equal(targetExchangeRate);
      // TODO: final shortfall
      expect(await riPool.finalSurplus()).to.equal(0);
    });

    it("should show the final surplus if there is one", async () => {
      // pay more than debt
      // mature
      // final surplus is correct
      // final exchange rate is target exchange
    });

    it("should show no final surplus if exact debt paid", async () => {
      // pay exactly the debt
      // mature
      // final surplus is 0
      // final exchange rate is target exchange
    });

    it("should not allow contributions after maturity", async () => {
      // mature
      // test contribution reverts
    });
  });

  describe("redemption", async () => {
    const redemptionAmount = parseUnits("5000", treasuryTokenDecimals);

    it("should not allow redemption before maturity", async () => {
      // pay the full debt
      await riPool.depositToTreasury(await riPool.couponDebt());

      await expect(riPool.connect(redeemer).redeem(redemptionAmount)).to.be.revertedWith(
        "ReimbursementPool: No redemptions before maturity",
      );
    });

    it("should take the redeemers riTokens", async () => {
      // pay the full debt
      await riPool.depositToTreasury(await riPool.couponDebt());

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      const preBalance = await riToken.balanceOf(redeemer.address);

      await riPool.connect(redeemer).redeem(redemptionAmount);

      const postBalance = await riToken.balanceOf(redeemer.address);
      expect(postBalance).to.equal(preBalance.sub(redemptionAmount));
    });

    it("should exchange riTokens for treasuryTokens at the target exchange rate if the full debt is paid", async () => {
      const expectedTreasuryRedemption = wmul(redemptionAmount, targetExchangeRate);

      // pay the full debt
      await riPool.depositToTreasury(await riPool.couponDebt());

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      await riPool.connect(redeemer).redeem(redemptionAmount);

      const redeemerTreasuryBalance = await treasuryToken.balanceOf(redeemer.address);
      expect(redeemerTreasuryBalance).to.equal(expectedTreasuryRedemption);
    });

    it("should exchange riTokens for treasuryTokens at the target exchange rate if more than the full debt is paid", async () => {
      const expectedTreasuryRedemption = wmul(redemptionAmount, targetExchangeRate);

      // pay more than the full debt
      const moreThanDebt = (await riPool.couponDebt()).add(parseUnits("1000", treasuryTokenDecimals));
      await riPool.depositToTreasury(moreThanDebt);

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      await riPool.connect(redeemer).redeem(redemptionAmount);

      const redeemerTreasuryBalance = await treasuryToken.balanceOf(redeemer.address);
      expect(redeemerTreasuryBalance).to.equal(expectedTreasuryRedemption);
    });

    it("should exchange riTokens for treasuryTokens at the final exchange rate if debt is not fully paid", async () => {
      const expectedTreasuryRedemption = wmul(redemptionAmount, targetExchangeRate.div(2));

      // pay half the debt
      const halfDebt = (await riPool.couponDebt()).div(2);
      await riPool.depositToTreasury(halfDebt);

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      await riPool.connect(redeemer).redeem(redemptionAmount);

      const redeemerTreasuryBalance = await treasuryToken.balanceOf(redeemer.address);
      expect(redeemerTreasuryBalance).to.equal(expectedTreasuryRedemption);
    });

    it("should emit a redemption event", async () => {
      const expectedTreasuryRedemption = wmul(redemptionAmount, targetExchangeRate);

      // pay the full debt
      await riPool.depositToTreasury(await riPool.couponDebt());

      // Reach maturity
      await fastForward(maturityTimeDiff);
      await riPool.mature();

      await expect(riPool.connect(redeemer).redeem(redemptionAmount))
        .to.emit(riPool, "Redemption")
        .withArgs(redeemer.address, redemptionAmount, expectedTreasuryRedemption);
    });
  });
});
