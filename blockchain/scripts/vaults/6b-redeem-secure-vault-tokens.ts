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

    console.log(`Redeem flow`);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);
    // test functions 
    const name = await vault.connect(investor).name();
    console.log(`Name is: ${name}`);
    const setAsset = await vault.connect(investor).asset();
    console.log(`Asset is: ${setAsset}`);

    const asset = await ethers.getContractAt('Asset', addresses.asset);

    console.log(`Vault asset balance: ${await asset.balanceOf(vault.address)}`);
    console.log(`Investor secure vault token shares: ${await vault.connect(investor).balanceOf(investor.address)}`);

    await vault.connect(investor).approve(vault.address, 100000000);
    console.log(`Token approval done`);

    await vault.connect(investor).redeem(100000000, investor.address, investor.address);

    console.log(`Investor secure vault token shares: ${await vault.connect(investor).balanceOf(investor.address)}`);
    console.log(`Investor assets balance: ${await asset.connect(investor).balanceOf(investor.address)}`);

}

main();
