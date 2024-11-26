import { ethers, upgrades } from "hardhat";
import { deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    let addresses;

    try {
        addresses = await readJsonFromFile('./scripts/vaults/data.json');
        console.log('Data from file:', addresses);

    } catch (error) {
        console.error(error);
    }

    // Connect to DeployManager
    const DeployManager = await ethers.getContractFactory("DeployManager");
    const deployManager = await DeployManager.connect(deployer).attach(addresses.deployManager);

    // Deploy vault
    let investorVault = await deployVaultInstance(
        deployManager,
        addresses.asset,
        "CustomerVault",
        "CVL",
        deployer.address
    );
    console.log(`Vault deployed at ${investorVault}`);

    // Connect to Vault
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.connect(deployer).attach(investorVault);

    // Add Investor 
    vault.connect(deployer).addInvestor(investor.address);

    const newData = {
        investorVault: investorVault
    };

    try {
        await appendJsonToFile('./scripts/vaults/data.json', newData);
        console.log('JSON data successfully appended to file.');
    } catch (error) {
        console.error(error);
    }
}

main();
