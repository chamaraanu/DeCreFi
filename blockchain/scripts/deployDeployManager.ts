import { ethers } from "hardhat";
import { deployManagerDeployment } from "./contractDeployFunctions";
import { saveAddress } from "./helpers/saveAddress";

async function main() {
    const [signer] = await ethers.getSigners();
    const deployerPrivatekey = process.env.DEPLOYER_PRIVATE_KEY as string;
    // Create wallet instances from private keys
    const walletAdmin = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
    const deployer = await walletAdmin.getAddress();

    // Deploy DeployManager Contract and related contracts
    const addresses: string[] = await deployManagerDeployment(signer);
    const deployManagerAddress = addresses[0];

    console.log("Deploy manager deployed at: ", deployManagerAddress);
    console.log("IdentityLogic Contract deployed at: ", addresses[1]);
    console.log("IdentityImplementationAuthority deployed at: ", addresses[2]);
    console.log("ClaimIssuer deployed at: ", addresses[3]);
    console.log("ClaimTopicsRegistry deployed at: ", addresses[4]);
    console.log("IdentityRegistry deployed at: ", addresses[6]);
    console.log("Token Implementation deployed at: ", addresses[7]);
    console.log("Vault logic contract deployed at: ", addresses[10]);

    // Save contract addresses to JSON
  let jsonData = {
    "deployManager": deployManagerAddress,
    "identityContract": addresses[1],
    "identityImplementationAuthorityContract": addresses[2],
    "claimIssuer": addresses[3],
    "claimTopicsRegistry": addresses[4],
    "identityRegistry": addresses[6],
    "tokenImplementation": addresses[7]
  };

  // Save JSON object containing contract addresses
  saveAddress(jsonData);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
