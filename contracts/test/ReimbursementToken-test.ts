// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken } from "../typechain/ReimbursementToken";
import { MockToken } from "../typechain/MockToken";
import { Signer } from "ethers";

// Conevenience variables
const { deployContract, loadFixture } = waffle;
const { parseUnits } = ethers.utils;

// Test constants
const TokenName = "Reimbursement Token";
const TokenSymbol = "RIT";
const MaturityDate = 2000000000; // Unix timestamp far in the future
const TokenSupply = parseUnits("1000000", 18);
const MintReceiver = ethers.Wallet.createRandom().address;

// Helper deploy method
const deployRiToken = (deployer: Signer, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params);
}

const deployMockToken = (deployer: Signer) => {
  const artifact = artifacts.readArtifactSync("MockToken");
  return deployContract(deployer, artifact, ["Mock Token", "MOCK"]);
}

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let token: ReimbursementToken;
  let mockToken: MockToken;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const mockToken = await deployMockToken(deployer) as MockToken;
    await mockToken.mint(deployer.address, TokenSupply);

    const token = await deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      mockToken.address,
      TokenSupply,
      MintReceiver,
    ]) as ReimbursementToken;

    return {mockToken, token};
  }

  beforeEach(async () => {
    const deployment = await loadFixture(setup);
    token = deployment.token;
    mockToken = deployment.mockToken;
  });

  it("should see the deployed token contract with the correct configuration", async () => {
    const name = await token.name();
    const maturity = await token.maturity();
    const underlying = await token.underlying();
    const symbol = await token.symbol();
    const supply = await token.totalSupply();

    expect(name).to.equal(TokenName);
    expect(maturity).to.equal(MaturityDate);
    expect(underlying).to.equal(mockToken.address,);
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
      mockToken.address,
      TokenSupply,
      MintReceiver,
    ])).to.be.revertedWith("ReimbursementToken: Maturity date must be in future");
  });

  it("should fail to deploy with a supply of zero", async () => {
    await expect(deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      mockToken.address,
      "0",
      MintReceiver,
    ])).to.be.revertedWith("ReimbursementToken: Supply must be greater than 0");
  });

  it("should fail to deploy with an underlying token that has no supply", async () => {
    const badToken = await deployMockToken(deployer);

    await expect(deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      badToken.address,
      TokenSupply,
      MintReceiver,
    ])).to.be.revertedWith("ReimbursementToken: Underlying supply must be greater than 0");
  });

  it("should fail to deploy with an underlying that is not a token", async () => {
    const notToken = ethers.Wallet.createRandom();

    await expect(deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      notToken.address,
      TokenSupply,
      MintReceiver,
    ])).to.be.reverted;
  });
});
