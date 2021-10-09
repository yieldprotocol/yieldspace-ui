// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken, MockToken, ReimbursementPool } from "../typechain/";
import { deployMockToken, deployRiToken } from "./utils";
import { BigNumberish } from "ethers";

// Conevenience variables
const { deployContract, loadFixture, deployMockContract } = waffle;
const { parseUnits } = ethers.utils;
const { AddressZero, MaxUint256 } = ethers.constants;

// Test inputs
const tokenName = "Reimbursement Token";
const tokenSymbol = "RIT";
const maturityDate = 2000000000; // Unix timestamp far in the future
const riTokenSupply = parseUnits("1000000", 18); // 1 million
const treasuryTokenDecimals = 6;
const treasuryTokenSupply = parseUnits("1000000000", treasuryTokenDecimals); // 1 billion
const collateralTokenDecimals = 8;
const collateralTokenSupply = parseUnits("21000000", collateralTokenDecimals); // 21 million
const mintReceiver = ethers.Wallet.createRandom().address;
const targetExchangeRate = parseUnits("1", 18);
const treasuryTokenSupplyAmount = parseUnits("1000", treasuryTokenDecimals);

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

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let riToken: ReimbursementToken;
  let riPool: ReimbursementPool;
  let treasuryToken: MockToken;
  let collateralToken: MockToken;

  before(async () => {
    [deployer, supplier] = await ethers.getSigners();
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
      mintReceiver,
    ]);

    // create collateral token and mint to deployer
    const collateralToken = await deployMockToken(deployer, "Governance Token", "GOV", collateralTokenDecimals);
    await collateralToken.mint(deployer.address, collateralTokenSupply);

    // create riPool
    const riPool = await deployPool(deployer, [riToken.address, collateralToken.address, targetExchangeRate]);

    // approve riPool for deployer
    await treasuryToken.approve(riPool.address, MaxUint256);

    // tranfer tokens & approve riPool for supplier
    await treasuryToken.transfer(supplier.address, treasuryTokenSupplyAmount);
    await treasuryToken.connect(supplier).approve(riPool.address, MaxUint256);

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
      await riPool.depositToTreasury(treasuryTokenSupplyAmount);

      // check internal accounting
      const treasuryBalance = await riPool.treasuryBalance();
      expect(treasuryBalance).to.equal(treasuryTokenSupplyAmount);

      // check actual transfer
      expect(await treasuryToken.balanceOf(riPool.address)).to.equal(treasuryBalance);
    });

    it("should allow treasury token contributions from anyone", async () => {
      await riPool.depositToTreasury(treasuryTokenSupplyAmount);
      await riPool.connect(supplier).depositToTreasury(treasuryTokenSupplyAmount);

      // check internal accounting
      const treasuryBalance = await riPool.treasuryBalance();
      expect(treasuryBalance).to.equal(treasuryTokenSupplyAmount.mul(2));

      // check actual transfer
      expect(await treasuryToken.balanceOf(riPool.address)).to.equal(treasuryBalance);
    });

    it("should emit an event when a contribution is made", async () => {
      await expect(riPool.connect(supplier).depositToTreasury(treasuryTokenSupplyAmount))
        .to.emit(riPool, "TreasuryDeposit")
        .withArgs(supplier.address, treasuryTokenSupplyAmount);
    });
  });
});
