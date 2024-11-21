import { ethers, upgrades } from "hardhat";
import { writeJsonToFile } from "../helpers/appendJSONToFile";
import { deployManagerDeployment } from "../contractDeployFunctions";

async function main() {
    let [deployer, investor] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);

    // Deploy DeployManager Contract and related contracts
    const addresses: string[] = await deployManagerDeployment(deployer);
    const deployManagerAddress = addresses[0];
    const vaultAddress = addresses[1]

    console.log("Deploy manager deployed at: ", deployManagerAddress);
    console.log("Vault Logic Contract deployed at: ", vaultAddress);

    const Asset = await ethers.getContractFactory("Asset");
    const investorAsset = Asset.connect(investor);
    // Deploy the Asset proxy using investor
    const asset = await upgrades.deployProxy(investorAsset, ["Asset Token", "AST"], { initializer: 'initialize' });
    await asset.deployed();
    console.log(`Asset ${asset.address} Balance of the investor is ${await asset.balanceOf(investor.address)}`);

    // Connect to DeployManager
  // const DeployManager = await ethers.getContractFactory("DeployManager");
  // const deployManager = await DeployManager.connect(deployer).attach(deployManagerAddress);

    // Writing data to file
    const data = {
        deployManager: deployManagerAddress,
        vaultLogic: vaultAddress,
        asset: asset.address
    };
    writeJsonToFile('./scripts/vaults/data.json', data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
