import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

/**
 * Deploy the DeployManager contract along with ERC20 Logic and ERC1155 Logic contracts.
 * @param signer - Signer with address used for deploying the contracts.
 * @returns An array containing the addresses of the DeployManager, ERC20 Logic, and ERC1155 Logic contracts.
 */
async function main() {
  let [deployer, investor] = await ethers.getSigners();

  // const contract:any = ethers.getContractAt('ClaimTopicsRegistry', "0x678628270A2b51dc81EfdD8083E566418A365ABe");

  const DeployManager = await ethers.getContractFactory("ClaimTopicsRegistry");
    const deployManager = await DeployManager.connect(deployer).attach("0x678628270A2b51dc81EfdD8083E566418A365ABe");


  const claimTopics: BigNumber[] = await deployManager.getClaimTopics();
  console.log(claimTopics);



  const estimatedGas = await DeployManager.estimateGas.create({ gasLimit: 3000000 });
console.log("Estimated gas:", estimatedGas.toString());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});