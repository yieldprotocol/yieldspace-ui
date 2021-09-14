// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken } from "../typechain/ReimbursementToken";

// Conevenience variables
const { deployContract } = waffle;
const { isAddress, parseUnits } = ethers.utils;

// Test constants
const TokenName = "Reimbursement Token";
const TokenSymbol = "RIT";
const MaturityDate = 2000000000; // Unix timestamp far in the future
const UnderlyingToken = ethers.Wallet.createRandom().address;
const TokenSupply = parseUnits("1000000", 18);
const MintReceiver = ethers.Wallet.createRandom().address;

// Helper deploy method
const deployRiToken = (deployer: SignerWithAddress, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params);
}

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let token: ReimbursementToken;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  beforeEach(async () => {
    token = await deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      UnderlyingToken,
      TokenSupply,
      MintReceiver,
    ]) as ReimbursementToken;
  });

  it("should see the deployed token contract with the correct configuration", async () => {
    const name = await token.name();
    const maturity = await token.maturity();
    const underlying = await token.underlying();
    const symbol = await token.symbol();
    const supply = await token.totalSupply();

    expect(name).to.equal(TokenName);
    expect(maturity).to.equal(MaturityDate);
    expect(underlying).to.equal(UnderlyingToken);
    expect(symbol).to.equal(TokenSymbol);
    expect(supply).to.equal(TokenSupply);
  });

  it("should mint the token supply to the supplied receiver", async () => {
    const receiverBalance = await token.balanceOf(MintReceiver);
    expect(receiverBalance).to.equal(TokenSupply);
  });

  it("should fail to deploy with a maturity date in the past", async () => {
    await expect(deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      0,
      UnderlyingToken,
      TokenSupply,
      MintReceiver,
    ])).to.be.revertedWith("ReimbursementToken: Maturity date must be in future");
  });

  it("should fail to deploy with a supply of zero", async () => {
    await expect(deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      UnderlyingToken,
      "0",
      MintReceiver,
    ])).to.be.revertedWith("ReimbursementToken: Supply must be greater than 0");
  });
});
