import { ethers, upgrades } from "hardhat";
import { writeJsonToFile } from "../helpers/appendJSONToFile";
import { deployManagerDeployment } from "../contractDeployFunctions";
import { formatUnits, parseUnits } from "ethers/lib/utils";

async function main() {
    let [deployer, investor, originator] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    console.log("Originator address- ", originator.address);

    // Deploy DeployManager Contract and related contracts
    const addresses: string[] = await deployManagerDeployment(deployer);
    const deployManagerAddress = addresses[0];
    const vaultAddress = addresses[1]

    console.log("Deploy manager deployed at: ", deployManagerAddress);
    console.log("Vault Logic Contract deployed at: ", vaultAddress);

    const Asset = await ethers.getContractFactory("Asset");
    const deployerAsset = Asset.connect(deployer);
    // Deploy the Asset proxy using deployer
    const asset = await upgrades.deployProxy(deployerAsset, ["Asset Token", "AST"], { initializer: 'initialize' });
    await asset.deployed();

    let tx;
    tx = await asset.mint(investor.address, parseUnits('1000', 6));
    await tx.wait();
    tx = await asset.mint(originator.address, parseUnits('100', 6));
    await tx.wait();
    console.log(`Asset is ${asset.address} `);
    console.log(`Balance of the investor is ${formatUnits(await asset.balanceOf(investor.address), 6)}`);
    console.log(`Balance of the originator is ${formatUnits(await asset.balanceOf(originator.address), 6)}`);

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
