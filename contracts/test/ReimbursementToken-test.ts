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
const TokenSupply = parseUnits("1000000", 18);
const MintReceiver = ethers.Wallet.createRandom().address;

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let token: ReimbursementToken;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const riTokenArtifact = await artifacts.readArtifact("ReimbursementToken");
    token = (await deployContract(deployer, riTokenArtifact, [
      TokenName,
      TokenSymbol,
      TokenSupply,
      MintReceiver,
    ])) as ReimbursementToken;
  });

  it("should see the deployed token contract with the correct ERC-20 configuration", async () => {
    expect(isAddress(token.address), "Failed to deploy ReimbursementToken").to.be.true;

    const name = await token.name();
    const symbol = await token.symbol();
    const supply = await token.totalSupply();

    expect(name).to.equal(TokenName);
    expect(symbol).to.equal(TokenSymbol);
    expect(supply).to.equal(TokenSupply);
  });

  it("should mint the token supply to the supplied receiver", async () => {
    const receiverBalance = await token.balanceOf(MintReceiver);
    expect(receiverBalance).to.equal(TokenSupply);
  });
});
