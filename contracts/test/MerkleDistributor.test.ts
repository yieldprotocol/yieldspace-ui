// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken, MockToken, MerkleDistributor } from "../typechain";
import { deployMockToken, deployRiToken } from "./utils";

// Conevenience variables
const { deployContract, loadFixture } = waffle;
const { parseUnits } = ethers.utils;

// Test inputs
const TokenName = "Reimbursement Token";
const TokenSymbol = "RIT";
const MaturityDate = 2000000000; // Unix timestamp far in the future
const TokenSupply = parseUnits("1000000", 18);

// Constants
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const deployDistributor = (deployer: SignerWithAddress, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("MerkleDistributor");
  return deployContract(deployer, artifact, params);
};

describe('MerkleDistributor', () => {
  let deployer: SignerWithAddress;
  let token: ReimbursementToken;
  let distributor: MerkleDistributor;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const mockToken = (await deployMockToken(deployer)) as MockToken;
    await mockToken.mint(deployer.address, TokenSupply);

    const token = (await deployRiToken(deployer, [
      TokenName,
      TokenSymbol,
      MaturityDate,
      mockToken.address,
      TokenSupply,
      deployer.address,
    ])) as ReimbursementToken;

    return { mockToken, token };
  }

  beforeEach(async () => {
    ({token} = await loadFixture(setup));
  });

  it('should properly deploy the distributor with the ritoken', async () => {
    distributor = await deployDistributor(deployer, [token.address, ZERO_BYTES32]) as MerkleDistributor;

    const distributorToken = await distributor.token();
    const merkleRoot = await distributor.merkleRoot();

    expect(distributorToken).to.equal(token.address);
    expect(merkleRoot).to.equal(ZERO_BYTES32);
  });
});