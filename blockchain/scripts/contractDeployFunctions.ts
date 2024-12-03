import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { deployImplementation } from "./helpers/deployHelper";

/**
 * Deploy the DeployManager contract along with ERC20 Logic and ERC1155 Logic contracts.
 * @param signer - Signer with address used for deploying the contracts.
 * @returns An array containing the addresses of the DeployManager, ERC20 Logic, and ERC1155 Logic contracts.
 */
export async function deployManagerDeployment(signer: SignerWithAddress): Promise<string[]> {

  // Deploy ERC20 Logic Contract
  const erc4626LogicContract = await await ethers.deployContract("Vault", []);
  await erc4626LogicContract.deployed();

  const erc1155LogicContract = await await ethers.deployContract("Loan", []);
  await erc1155LogicContract.deployed();

  console.log(`1155 ${erc1155LogicContract.address}`)

  // Deploy DeployManager Contract
  const DeployManager = await ethers.getContractFactory("DeployManager");

  const deployManagerContract = await DeployManager.connect(signer).deploy(
    erc4626LogicContract.address,
    erc1155LogicContract.address
  );

  return [
    deployManagerContract.address,
    erc4626LogicContract.address
  ];
}

export async function waitForReceipt(txHash: string, providerUrl: string) {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  let receipt = null;
  while (receipt === null) {
    receipt = await provider.getTransactionReceipt(txHash);
    // Wait for a short period before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return receipt;
}