import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";

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

    const vault = await ethers.getContractAt('Vault', addresses.investorVault);
    const exRate = parseFloat(ethers.utils.formatUnits(await vault.getExchangeRate(), 18));
    
    console.log(`Ex Rate is: ${exRate}`)
}

main();