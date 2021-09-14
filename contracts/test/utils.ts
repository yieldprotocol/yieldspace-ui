import { artifacts, ethers, waffle } from "hardhat";
import { Signer } from "ethers";
const { deployContract } = waffle;

export const deployRiToken = (deployer: Signer, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params);
};

export const deployMockToken = (deployer: Signer) => {
  const artifact = artifacts.readArtifactSync("MockToken");
  return deployContract(deployer, artifact, ["Mock Token", "MOCK"]);
};
